import Alpine from "../js/alpine.esm.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const addClasses = (el, classes) => {
  classes = classes.split(" ");
  for (let _class of classes) {
    el.classList.add(_class);
  }
};

const appendChildren = (el, children) => {
  for (let child of children) {
    el.appendChild(child);
  }
};

const fetchDb = async () => {
  const res = await fetch("database.json");
  try {
    const db = await res.json();
    if (db) {
      for (let key in db) {
        Alpine.store("db").set(key, db[key]);
      }
      Alpine.store("loaded").set(true);
      document.querySelector(".show-later").style.display = "none";
    } else {
      alert("An error occurred while loading the page. Please refresh!");
    }
  } catch (e) {
    console.warn(e);
    alert("An error occurred while loading the page. Please refresh!");
  }
};

document.addEventListener("alpine:init", () => {
  Alpine.store("loaded", {
    state: false,
    set(val) {
      this.state = val;
    },
  });

  Alpine.store("db", {
    files: {},
    socials: {},
    helpDialogs: {},
    set(key, val) {
      this[key] = val;
    },
  });

  fetchDb();

  Alpine.store("terminal", {
    commands: {
      help(...params) {
        if (params.length) {
          for (let param of params) {
            if (!this.commands[param]) {
              return this.output({
                type: "error",
                message: `"${param}": command not found!`,
              });
            }

            this.displayHelp(param);
          }
          return;
        }

        this.displayHelp();
      },
      cls() {
        return this.commands.clear();
      },
      clear() {
        document.querySelector("#commandOutput").innerHTML = "";
      },
      exit() {
        window.open("", "_self");
        window.close();
      },
      cat(...params) {
        if (params.length === 0) {
          return this.output({ type: "message", message: "Usage: cat <file>" });
        }

        if (params.length > 1)
          return this.output({ type: "error", message: "Invalid parameters!" });

        if (!Alpine.store("db").files[params[0]])
          return this.output({
            type: "error",
            message: "File does not exist!",
          });

        const container = document.createElement("div");
        addClasses(container, "flex gap-x-1");

        const fileContent = document.createElement("span");

        /*
        ;(async () => {
          const res = await fetch(`files/${params[0]}.html`)
          const data = await res.text()
          fileContent.innerHTML = data
        })()
        */

        fileContent.innerHTML = Alpine.store("db").files[params[0]];

        container.appendChild(fileContent);

        document.querySelector("#commandOutput").appendChild(container);
      },
      ls(...params) {
        if (params.length > 1)
          return this.output({ type: "error", message: "Invalid parameters!" });

        const container = document.createElement("div");
        addClasses(container, "flex gap-x-1");

        for (let file in Alpine.store("db").files) {
          const fileName = document.createElement("span");
          fileName.setAttribute(
            "x-on:click",
            `$store.terminal.executeCommand("cat ${file}")`
          );
          addClasses(fileName, "text-green underline cursor-pointer");
          fileName.innerText = file;

          container.appendChild(fileName);
        }
        document.querySelector("#commandOutput").appendChild(container);
      },
      whoami(...params) {
        const container = document.createElement("div");

        const fileContent = document.createElement("span");

        /*
        ;(async () => {
          const res = await fetch('files/whoami.html')
          const data = await res.text()
          fileContent.innerHTML = data
        })()
        */

        fileContent.innerHTML = Alpine.store("db").whoami;

        container.appendChild(fileContent);

        document.querySelector("#commandOutput").appendChild(container);
      },
      service(...params) {
        if (params.length === 0) {
          const container = document.createElement("div");

          const usage = document.createElement("span");
          usage.innerHTML =
            'Usage: service <span class="underline cursor-pointer" x-on:click="$store.terminal.executeCommand(\'service --all\')">--all</span> | [ service_name status ]';

          appendChildren(container, [usage]);
          return document
            .querySelector("#commandOutput")
            .appendChild(container);
        } else if (params.length === 1) {
          if (params[0] === "--all") {
            const container = document.createElement("div");

            for (let service in Alpine.store("db").services) {
              const serviceContainer = document.createElement("div");
              addClasses(serviceContainer, "cursor-pointer");
              serviceContainer.setAttribute(
                "x-on:click",
                `$store.terminal.executeCommand("service ${service} status")`
              );

              const serviceStatus = document.createElement("span");
              addClasses(serviceStatus, "text-green");
              serviceStatus.innerText = "[+] ";

              const serviceName = document.createElement("span");
              addClasses(serviceName, "text-green underline");
              serviceName.innerText = service;

              appendChildren(serviceContainer, [serviceStatus, serviceName]);
              container.appendChild(serviceContainer);
            }

            return document
              .querySelector("#commandOutput")
              .appendChild(container);
          }

          const container = document.createElement("div");

          const usage = document.createElement("span");
          usage.innerHTML = `Usage: service ${params[0]} <span class="underline cursor-pointer" x-on:click="$store.terminal.executeCommand(\'service ${params[0]} status\')">status</span>`;

          container.appendChild(usage);
          return document
            .querySelector("#commandOutput")
            .appendChild(container);
        } else if (params.length === 2) {
          const service = Alpine.store("db").services[params[0]];

          if (!service) {
            console.error("service DNE!");
            return false;
          }

          const container = document.createElement("div");
          addClasses(container, "flex flex-col");

          const serviceTitle = document.createElement("span");
          serviceTitle.innerHTML = `<i class="fa-solid fa-circle-dot text-green"></i> ${service.id}.service - ${service.name}`;

          const serviceLoaded = document.createElement("span");
          addClasses(serviceLoaded, "ml-1");
          serviceLoaded.innerHTML =
            "Loaded: loaded <i class='fa-solid fa-rocket'></i>";

          const serviceStatus = document.createElement("span");
          addClasses(serviceStatus, "ml-1");
          serviceStatus.innerHTML =
            "Active: <span class='text-green'>active (running)</span>";

          const serviceDetailsTitle = document.createElement("span");
          addClasses(serviceDetailsTitle, "ml-1");
          serviceDetailsTitle.innerHTML = "Details:";

          const serviceDetails = document.createElement("span");
          addClasses(serviceDetails, "ml-2");
          serviceDetails.innerHTML = service.details;

          appendChildren(container, [
            serviceTitle,
            serviceLoaded,
            serviceStatus,
            serviceDetailsTitle,
            serviceDetails,
          ]);
          return document
            .querySelector("#commandOutput")
            .appendChild(container);
        }

        return this.output({
          type: "error",
          message: "Invalid arguments supplied!",
        });
      },
    },
    pwd: "~/.../portfolio",
    _prompt: "",
    stdin: "",
    history: [],
    historyIndex: 0,
    title: "My Portfolio | Uchenna Ofoma", //window.location.hostname,
    handleSelection() {
      console.log("text was selected");
    },
    displayHelp(command) {
      const template = document.createElement("div");

      let commands = Alpine.store("db")?.helpDialogs;
      if (command) {
        commands = {};
        commands[command] = Alpine.store("db")?.helpDialogs[command];
      }

      for (let command in commands) {
        const container = document.createElement("div");
        addClasses(container, "flex flex-col");

        const title = document.createElement("span");
        addClasses(title, "text-green underline cursor-pointer");
        title.setAttribute(
          "x-on:click",
          `$store.terminal.executeCommand("${command}")`
        );
        title.innerText = command;

        const help = document.createElement("span");
        addClasses(help, "ml-3");
        help.innerText = Alpine.store("db")?.helpDialogs[command];

        appendChildren(container, [title, help]);
        template.appendChild(container);
      }

      document.querySelector("#commandOutput").appendChild(template);
    },
    setPrompt(val) {
      this._prompt = val;
    },
    createPastPrompt() {
      const container = document.createElement("div");
      addClasses(container, "flex flex-col mt-1");

      const promptPath = document.createElement("span");
      addClasses(promptPath, "path text-purple");
      promptPath.innerText = this.pwd;

      const promptContainer = document.createElement("span");
      promptContainer.classList.add("flex");

      const promptIcon = document.createElement("i");
      addClasses(promptIcon, "fa-solid fa-chevron-right mr-1/2 text-green");

      const promptText = document.createElement("span");
      promptText.innerText = this.stdin;

      appendChildren(promptContainer, [promptIcon, promptText]);
      appendChildren(container, [promptPath, promptContainer]);
      document.querySelector("#commandOutput").appendChild(container);
    },
    output(obj) {
      const container = document.createElement("div");

      if (obj.type === "error") {
        addClasses(container, "text-red error");
        container.innerText = "Error: " + obj.message;
      } else if (obj.type === "message") {
        container.innerText = obj.message;
      }

      document.querySelector("#commandOutput").appendChild(container);
    },
    moveCaret(e) {
      const keyCode = e.keyCode ? e.keyCode : e.which;
      const commandCaret = document.querySelector("#commandCaret");
      let marginLeft = Number(commandCaret.style.marginLeft.replace("em", ""));
      if (!marginLeft) marginLeft = 0;

      if (keyCode === 37) {
        // ArrowLeft
        if (marginLeft !== 0.5 * this.stdin.length * -1) marginLeft -= 0.5;
      } else if (keyCode === 39) {
        // ArrowRight
        if (!(marginLeft === 0)) marginLeft += 0.5;
      } else if (keyCode === 38) {
        // ArrowUp
        if (this.historyIndex === this.history.length) this.historyIndex -= 1;

        if (this.history[this.historyIndex]) {
          this.stdin = this.history[this.historyIndex];
          this.historyIndex -= 1;
        } else {
          this.historyIndex = 0;
        }
      } else if (keyCode === 40) {
        // ArrowDown
        if (this.historyIndex === -1) this.historyIndex = 1;

        if (this.history[this.historyIndex]) {
          this.stdin = this.history[this.historyIndex];
          this.historyIndex += 1;
        } else {
          this.historyIndex = this.history.length;
        }
      }

      commandCaret.style.marginLeft = `${marginLeft}em`;
    },
    formatPrompt(value) {
      Alpine.store("terminal").setPrompt(value.replace(" ", "&nbsp;"));
    },
    async writeCommand(command, callback = () => {}) {
      await delay(1000);
      for (let i = 0; i < command.length; i++) {
        await delay(300);

        this.stdin += command[i];
      }
      await delay(300);
      this.executeCommand(command);
      callback();
    },
    executeCommand(command) {
      this.stdin = command;
      this.createPastPrompt();
      if (this.stdin) this.processCommand(this.stdin);
      this.history.push(this.stdin);
      this.historyIndex = this.history.length - 1;
      this.stdin = "";

      this.scrollToBottom();
    },
    processCommand(fullCommand) {
      const command = fullCommand.split(" ")[0];
      const params = fullCommand.split(" ").splice(1);
      if (this.commands[command]) {
        return this.commands[command].apply(this, params);
      }
      return this.output({
        type: "error",
        message: `${this.stdin}: command not found!`,
      });
    },
    scrollToBottom() {
      const scrollbar = document.querySelector("#scrollbar");
      scrollbar.scroll({ top: scrollbar.scrollHeight, behavior: "smooth" });
    },
    onKeyPress(e) {
      const keyCode = e.keyCode ? e.keyCode : e.which;
      if (keyCode === 13) {
        this.executeCommand(this.stdin);
      }
    },
  });

  Alpine.data("state", () => {
    return {
      socials: {
        github: "https://github.com/Adophilus",
      },
    };
  });
});

Alpine.start();
