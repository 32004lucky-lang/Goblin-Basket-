import os
import sys
import subprocess
import threading
import time
import shutil

# Ensure Node.js is available in PATH on Windows
if os.name == 'nt':
    node_path = r"C:\Program Files\nodejs"
    if os.path.exists(node_path) and node_path not in os.environ.get("PATH", ""):
        os.environ["PATH"] = os.environ.get("PATH", "") + os.pathsep + node_path


# Ensure stdout uses UTF-8 encoding on Windows to prevent UnicodeEncodeError
if sys.name if False else True:
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Check for required python libraries and print a friendly message if missing
try:
    from colorama import init, Fore, Style
    import psutil
    import requests
except ImportError:
    print("Some required Python packages are missing.")
    print("Please install them by running: pip install -r requirements.txt")
    sys.exit(1)

# Initialize colorama for Windows terminal support
init(autoreset=True)

SERVICES = {
    "auth": {
        "dir": "services/auth",
        "cmd": ["npm", "run", "dev"],
        "color": Fore.BLUE,
        "port": 5000
    },
    "restaurant": {
        "dir": "services/restaurant",
        "cmd": ["npm", "run", "dev"],
        "color": Fore.GREEN,
        "port": 5001
    },
    "utils": {
        "dir": "services/utils",
        "cmd": ["npm", "run", "dev"],
        "color": Fore.WHITE,
        "port": 5002
    },
    "realtime": {
        "dir": "services/realtime",
        "cmd": ["npm", "run", "dev"],
        "color": Fore.YELLOW,
        "port": 5004
    },
    "rider": {
        "dir": "services/rider",
        "cmd": ["npm", "run", "dev"],
        "color": Fore.RED,
        "port": 5005
    },
    "admin": {
        "dir": "services/admin",
        "cmd": ["npm", "run", "dev"],
        "color": Fore.MAGENTA,
        "port": 5006
    },
    "frontend": {
        "dir": "frontend",
        "cmd": ["npm", "run", "dev"],
        "color": Fore.CYAN,
        "port": 5173
    }
}

running_processes = []
print_lock = threading.Lock()

def print_header(message):
    print(f"\n{Style.BRIGHT}{Fore.CYAN}=== {message} ==={Style.RESET_ALL}")

def print_success(message):
    print(f"{Fore.GREEN}[OK] {message}")

def print_warning(message):
    print(f"{Fore.YELLOW}[WARN] {message}")

def print_error(message):
    print(f"{Fore.RED}[ERR] {message}")

def check_command(cmd):
    """Check if a shell command is available in the environment."""
    return shutil.which(cmd) is not None

def setup_env_files():
    print_header("Configuring Environment Files")
    
    # We want to automatically replace placeholder Mongo URLs with a local MongoDB url if needed
    local_mongo = "mongodb://localhost:27017/Zomato_Clone"
    placeholder = "your_mongo_Db_url"
    
    modified_any = False
    
    for service_name, info in SERVICES.items():
        env_path = os.path.join(info["dir"], ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            if placeholder in content:
                print(f"Replacing default placeholder database URL in {info['dir']}/.env...")
                content = content.replace(placeholder, local_mongo)
                with open(env_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print_success(f"Configured MongoDB URI for {service_name} to local docker container.")
                modified_any = True
            else:
                # Check if it has a configured DB connection
                if "MONGO_URI=" in content:
                    print(f"Service {service_name} environment is already configured.")
        else:
            print_warning(f"No .env file found in {info['dir']}. You may need to create one.")
            
    if not modified_any:
        print_success("All existing environment files are ready.")

def check_docker_and_start_databases():
    print_header("Checking Databases & Message Brokers (Docker)")
    
    if not check_command("docker"):
        print_warning("Docker is not installed or not in your PATH.")
        print("Please ensure MongoDB (port 27017) and RabbitMQ (port 5672) are running locally.")
        return

    # Check if docker daemon is running
    try:
        subprocess.run(["docker", "info"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print_warning("Docker daemon is not running. Please start Docker Desktop.")
        print("Please ensure MongoDB (port 27017) and RabbitMQ (port 5672) are running locally.")
        return

    # Docker is running. Ask to spin up databases
    print("Docker is active. Starting MongoDB and RabbitMQ via Docker Compose...")
    try:
        subprocess.run(["docker", "compose", "up", "-d"], check=True)
        print_success("Databases (MongoDB) & Message Brokers (RabbitMQ) are up and running!")
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to start Docker services: {e}")

def check_and_install_node_dependencies():
    print_header("Checking Node.js Dependencies")
    
    if not check_command("npm"):
        print_error("npm/Node.js is not installed or not in your PATH. Please install Node.js (v22+ recommended).")
        sys.exit(1)
        
    needs_install = False
    
    # Check if node_modules exists in all directories
    for service_name, info in SERVICES.items():
        node_modules_path = os.path.join(info["dir"], "node_modules")
        if not os.path.exists(node_modules_path):
            print_warning(f"Dependencies missing for {service_name} (no node_modules).")
            needs_install = True
            
    # Check root node_modules
    if not os.path.exists("node_modules"):
        needs_install = True
        
    if needs_install:
        print("Installing dependencies for all services. This may take a couple of minutes...")
        try:
            # Use shell=True for windows compatibility with npm command execution
            subprocess.run("npm run install:all", shell=True, check=True)
            print_success("All dependencies installed successfully!")
        except subprocess.CalledProcessError as e:
            print_error(f"Failed to install dependencies: {e}")
            sys.exit(1)
    else:
        print_success("All dependencies are already installed.")

def log_streamer(proc, prefix, color):
    """Stream stdout and stderr from process with colors and prefixes."""
    while True:
        line = proc.stdout.readline()
        if not line and proc.poll() is not None:
            break
        if line:
            # Decode with ignore to prevent crashing on invalid UTF-8 characters
            decoded = line.decode("utf-8", errors="ignore").rstrip()
            with print_lock:
                try:
                    print(f"{color}[{prefix}]{Style.RESET_ALL} {decoded}")
                except Exception:
                    clean_decoded = decoded.encode('ascii', 'replace').decode('ascii')
                    print(f"{color}[{prefix}]{Style.RESET_ALL} {clean_decoded}")

def start_services():
    print_header("Launching All Services")
    
    for name, info in SERVICES.items():
        print(f"Starting {info['color']}{name}{Style.RESET_ALL} service...")
        
        # Use shell=True to execute npm scripts properly on Windows
        proc = subprocess.Popen(
            info["cmd"],
            cwd=info["dir"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=True
        )
        running_processes.append((name, proc))
        
        # Start a thread to read logs concurrently
        t = threading.Thread(target=log_streamer, args=(proc, name, info["color"]), daemon=True)
        t.start()
        
        # Stagger service startup slightly
        time.sleep(0.5)

    print_header("All Services Launched")
    print("Press Ctrl+C to terminate all services.")
    print("Access the Frontend at: http://localhost:5173")
    print("Access RabbitMQ Management at: http://localhost:15672 (admin/admin123)")
    print("-" * 50)

def kill_child_processes(parent_pid, sig=15):
    """Recursively kill child processes. Vital for Windows Node/npm processes."""
    try:
        parent = psutil.Process(parent_pid)
    except psutil.NoSuchProcess:
        return
    
    children = parent.children(recursive=True)
    for child in children:
        try:
            child.kill()
        except psutil.NoSuchProcess:
            pass
            
    try:
        parent.kill()
    except psutil.NoSuchProcess:
        pass

def cleanup():
    print_header("Shutting Down Services")
    for name, proc in running_processes:
        print(f"Terminating {name} (PID: {proc.pid})...")
        kill_child_processes(proc.pid)
    print_success("All services shut down successfully.")

def main():
    print(rf"""{Fore.GREEN}
  _____ ___  __  __   _ _____ ___  
 |_   _/ _ \|  \/  | /_\_   _/ _ \ 
   | || (_) | |\/| |/ _ \| || (_) |
   |_| \___/|_|  |_/_/   \_\_| \___/ 
                                     
   Tomato Code Multi-Service Manager
    """)
    
    setup_env_files()
    check_docker_and_start_databases()
    check_and_install_node_dependencies()
    
    try:
        start_services()
        # Keep main thread alive while services run
        while True:
            # Check if any service died unexpectedly
            for name, proc in running_processes:
                if proc.poll() is not None:
                    print_error(f"Service {name} stopped unexpectedly with code {proc.returncode}.")
                    # Remove it from active check
                    running_processes.remove((name, proc))
            time.sleep(2)
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received.")
    finally:
        cleanup()

if __name__ == "__main__":
    main()
