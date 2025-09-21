// class Terminal {
//     constructor() {
//         this.input = document.getElementById('command-input');
//         this.output = document.getElementById('terminal-output');
//         this.status = document.getElementById('status-text');
//         this.currentDir = document.getElementById('current-directory');
//         this.suggestions = document.getElementById('suggestions');

//         this.commandHistory = [];
//         this.historyIndex = -1;

//         this.init();
//     }

//     init() {
//         this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
//         this.input.addEventListener('input', this.handleInput.bind(this));

//         // Update system info periodically
//         this.updateSystemInfo();
//         setInterval(() => this.updateSystemInfo(), 5000);
//     }

//     handleKeyDown(event) {
//         if (event.key === 'Enter') {
//             event.preventDefault();
//             this.executeCommand();
//         } else if (event.key === 'ArrowUp') {
//             event.preventDefault();
//             this.navigateHistory(-1);
//         } else if (event.key === 'ArrowDown') {
//             event.preventDefault();
//             this.navigateHistory(1);
//         } else if (event.key === 'Tab') {
//             event.preventDefault();
//             this.handleTabCompletion();
//         }
//     }

//     handleInput(event) {
//         this.showSuggestions(event.target.value);
//     }

//     async executeCommand() {
//         const command = this.input.value.trim();
//         if (!command) return;

//         this.commandHistory.push(command);
//         this.historyIndex = this.commandHistory.length;

//         this.appendOutput(`user@python-terminal:~$ ${command}`, 'command');
//         this.status.textContent = 'Executing...';

//         try {
//             const response = await fetch('/execute', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ command })
//             });

//             const result = await response.json();

//             if (result.success) {
//                 this.appendOutput(result.output, result.type);
//             } else {
//                 this.appendOutput(result.output, 'error');
//             }
//         } catch (error) {
//             this.appendOutput(`Error: ${error.message}`, 'error');
//         }

//         this.status.textContent = 'Ready';
//         this.input.value = '';
//         this.hideSuggestions();
//     }

//     appendOutput(text, type = 'normal') {
//         const outputLine = document.createElement('div');
//         outputLine.className = `command-output output-${type}`;
//         outputLine.textContent = text;
//         this.output.appendChild(outputLine);

//         this.output.scrollTop = this.output.scrollHeight;
//     }

//     navigateHistory(direction) {
//         if (this.commandHistory.length === 0) return;

//         this.historyIndex = Math.max(-1,
//             Math.min(this.commandHistory.length - 1, this.historyIndex + direction));

//         if (this.historyIndex >= 0) {
//             this.input.value = this.commandHistory[this.historyIndex];
//         } else {
//             this.input.value = '';
//         }
//     }

//     showSuggestions(input) {
//         if (input.length < 2) {
//             this.hideSuggestions();
//             return;
//         }

//         const commonCommands = [
//             'ls', 'cd', 'pwd', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'cat', 'grep',
//             'python', 'pip install', 'git status', 'git add', 'git commit',
//             'create a folder', 'show me files', 'list all files', 'find files'
//         ];

//         const matches = commonCommands.filter(cmd =>
//             cmd.toLowerCase().includes(input.toLowerCase())
//         );

//         if (matches.length > 0) {
//             this.suggestions.innerHTML = matches
//                 .slice(0, 5)
//                 .map(cmd => `<span style="margin-right: 15px; cursor: pointer;" data-command="${cmd}">${cmd}</span>`)
//                 .join('');

//             this.suggestions.style.display = 'block';

//             this.suggestions.querySelectorAll('[data-command]').forEach(item => {
//                 item.addEventListener('click', () => {
//                     this.input.value = item.dataset.command;
//                     this.hideSuggestions();
//                     this.input.focus();
//                 });
//             });
//         } else {
//             this.hideSuggestions();
//         }
//     }

//     hideSuggestions() {
//         this.suggestions.style.display = 'none';
//     }

//     handleTabCompletion() {
//         const input = this.input.value;
//         const commonCommands = ['ls', 'cd', 'pwd', 'python', 'pip', 'git'];

//         const matches = commonCommands.filter(cmd => cmd.startsWith(input));
//         if (matches.length === 1) {
//             this.input.value = matches[0] + ' ';
//         }
//     }

//     async updateSystemInfo() {
//         try {
//             const response = await fetch('/system_info');
//             const result = await response.json();

//             if (result.success) {
//                 document.getElementById('cpu-usage').textContent =
//                     `CPU: ${result.data.cpu_percent || '--'}%`;
//                 document.getElementById('memory-usage').textContent =
//                     `MEM: ${result.data.memory_percent || '--'}%`;
//             }
//         } catch (error) {
//             // Silently handle errors
//         }
//     }
// }

// document.addEventListener('DOMContentLoaded', () => {
//     new Terminal();
// });

class Terminal {
  constructor() {
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentTheme = "theme-matrix";

    this.initializeElements();
    this.bindEvents();
    this.loadSystemInfo();
    this.updateTime();
    this.focusInput();
  }

  initializeElements() {
    this.commandInput = document.getElementById("commandInput");
    this.terminalOutput = document.getElementById("terminalOutput");
    this.themeSelector = document.getElementById("themeSelector");
    this.sidebar = document.getElementById("sidebar");
    this.timeElement = document.getElementById("currentTime");
    this.systemInfo = document.getElementById("systemInfo");
  }

  bindEvents() {
    // Command input
    this.commandInput.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Theme selector
    this.themeSelector.addEventListener("change", (e) =>
      this.changeTheme(e.target.value)
    );

    // Clear terminal button
    document
      .getElementById("clearTerminal")
      .addEventListener("click", () => this.clearTerminal());

    // Toggle sidebar
    document
      .getElementById("toggleSidebar")
      .addEventListener("click", () => this.toggleSidebar());

    // File explorer clicks
    document.querySelectorAll(".folder, .file").forEach((item) => {
      item.addEventListener("click", (e) =>
        this.handleFileClick(e.target.dataset.path)
      );
    });
  }

  async loadSystemInfo() {
    try {
      const response = await fetch("/system_info");
      const data = await response.json();

      this.systemInfo.innerHTML = `
                <p><strong>System Info:</strong></p>
                <p>OS: ${data.os || "Unknown"}</p>
                <p>Python: ${data.python_version || "Unknown"}</p>
                <p>CPU: ${data.cpu_count || "Unknown"} cores</p>
                <p>Memory: ${data.memory || "Unknown"}</p>
            `;
    } catch (error) {
      this.systemInfo.innerHTML = `
                <p><strong>System Info:</strong></p>
                <p>Ready to accept commands</p>
                <p>Type 'help' for available commands</p>
            `;
    }
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      this.executeCommand(this.commandInput.value);
      this.commandInput.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.navigateHistory("up");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.navigateHistory("down");
    } else if (e.key === "Tab") {
      e.preventDefault();
      this.autoComplete();
    }
  }

  executeCommand(command) {
    if (!command.trim()) return;

    // Add to history
    this.commandHistory.push(command);
    this.historyIndex = -1;

    // Display command
    this.addToOutput(
      `<div class="command-line"><span class="prompt">user@python-terminal:~$</span> ${command}</div>`
    );

    // Process command
    const result = this.processCommand(command);
    if (result) {
      this.addToOutput(`<div class="command-output">${result}</div>`);
    }

    this.scrollToBottom();
  }

  processCommand(command) {
    const cmd = command.toLowerCase().trim();

    // Help command
    if (cmd === "help") {
      return `Available commands:
- ls, dir - List directory contents
- pwd - Show current directory  
- cd [directory] - Change directory
- python [file] - Run Python script
- pip [command] - Package manager
- clear - Clear terminal
- theme [name] - Change theme (matrix, dark, blue, cyberpunk)
- help - Show this help
- exit - Close terminal
- Or use natural language like "create a file called test.py"`;
    }

    // Clear command
    if (cmd === "clear") {
      this.clearTerminal();
      return "";
    }

    // List directory
    if (cmd.startsWith("ls") || cmd.startsWith("dir")) {
      return `app/          documentation/  new/        static/      tests/       venv/
new1/         templates/      utilities/  README.md    requirements.txt    run.py`;
    }

    // Present working directory
    if (cmd === "pwd") {
      return "C:\\Users\\Admin\\Downloads\\Python_terminal\\Python terminal";
    }

    // Python commands
    if (cmd.startsWith("python")) {
      const parts = cmd.split(" ");
      if (parts.length > 1) {
        const file = parts[1];
        return `[AI] Executing Python script: ${file}\n>>> Script execution simulated <<<`;
      }
      return `Python 3.13.0 (tags/v3.13.0:60403a5, Oct  7 2024, 09:38:07)
Type "help", "copyright", "credits" or "license" for more information.
>>> `;
    }

    // Pip commands
    if (cmd.startsWith("pip")) {
      const parts = cmd.split(" ").slice(1);
      return `[AI] Pip command: ${parts.join(
        " "
      )}\nPackage management operation simulated`;
    }

    // Change directory
    if (cmd.startsWith("cd")) {
      const dir = cmd.split(" ")[1];
      return dir
        ? `Changed directory to: ${dir}`
        : "C:\\Users\\Admin\\Downloads\\Python_terminal\\Python terminal";
    }

    // Theme command
    if (cmd.startsWith("theme ")) {
      const theme = cmd.split(" ")[1];
      const validThemes = ["matrix", "dark", "blue", "cyberpunk"];
      if (validThemes.includes(theme)) {
        this.changeTheme(`theme-${theme}`);
        this.themeSelector.value = `theme-${theme}`;
        return `Theme changed to ${theme}`;
      } else {
        return `Invalid theme. Available themes: ${validThemes.join(", ")}`;
      }
    }

    // Exit command
    if (cmd === "exit") {
      return "Goodbye! Terminal session ended.";
    }

    // Natural language processing
    if (cmd.includes("create") || cmd.includes("make")) {
      return `[AI] Natural Language Processing: "${command}"
>>> Interpreting command...
>>> Would create the requested file/folder`;
    }

    if (cmd.includes("delete") || cmd.includes("remove")) {
      return `[AI] Natural Language Processing: "${command}"
>>> Interpreting delete command...
>>> Would remove the specified item`;
    }

    // Default response
    return `[AI] Command processed: "${command}"
>>> Command interpreted and ready for execution
>>> Use 'help' to see available commands`;
  }

  addToOutput(content) {
    this.terminalOutput.innerHTML += content;
  }

  clearTerminal() {
    this.terminalOutput.innerHTML = `
            <div class="system-info">
                <p><strong>Terminal cleared</strong></p>
                <p>Welcome back to Python Terminal with AI capabilities!</p>
                <p>Type 'help' for available commands</p>
            </div>
        `;
  }

  navigateHistory(direction) {
    if (
      direction === "up" &&
      this.historyIndex < this.commandHistory.length - 1
    ) {
      this.historyIndex++;
      this.commandInput.value =
        this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    } else if (direction === "down" && this.historyIndex > 0) {
      this.historyIndex--;
      this.commandInput.value =
        this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    } else if (direction === "down" && this.historyIndex === 0) {
      this.historyIndex = -1;
      this.commandInput.value = "";
    }
  }

  autoComplete() {
    const input = this.commandInput.value;
    const commands = [
      "help",
      "ls",
      "dir",
      "pwd",
      "cd",
      "python",
      "pip",
      "clear",
      "theme",
      "exit",
    ];

    const matches = commands.filter((cmd) =>
      cmd.startsWith(input.toLowerCase())
    );

    if (matches.length === 1) {
      this.commandInput.value = matches[0];
    } else if (matches.length > 1) {
      this.addToOutput(
        `<div class="command-output">Available completions: ${matches.join(
          ", "
        )}</div>`
      );
      this.scrollToBottom();
    }
  }

  changeTheme(themeName) {
    document.body.className = themeName;
    this.currentTheme = themeName;
  }

  toggleSidebar() {
    this.sidebar.classList.toggle("hidden");
  }

  handleFileClick(path) {
    this.addToOutput(
      `<div class="command-line"><span class="prompt">user@python-terminal:~$</span> Opening ${path}</div>`
    );
    this.addToOutput(`<div class="command-output">[AI] File selected: ${path}
>>> File operations available for: ${path}</div>`);
    this.scrollToBottom();
  }

  updateTime() {
    if (this.timeElement) {
      const now = new Date();
      this.timeElement.textContent = now.toLocaleTimeString();
    }
  }

  scrollToBottom() {
    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
  }

  focusInput() {
    this.commandInput.focus();
  }
}

// Initialize terminal when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const terminal = new Terminal();

  // Update time every second
  setInterval(() => terminal.updateTime(), 1000);

  // Keep input focused
  document.addEventListener("click", (e) => {
    if (e.target !== terminal.commandInput) {
      setTimeout(() => terminal.focusInput(), 100);
    }
  });
});
