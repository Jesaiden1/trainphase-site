(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.getElementById("site-header");
  const progressBar = document.getElementById("scroll-progress-bar");

  /* -----------------------------------------------------------------------
     Scroll state + progress
     ----------------------------------------------------------------------- */
  let scrollTicking = false;

  const updateScrollState = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;

    if (progressBar) progressBar.style.width = `${(progress * 100).toFixed(2)}%`;
    if (header) header.classList.toggle("is-scrolled", scrollTop > 8);
    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollState);
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });
  updateScrollState();

  /* -----------------------------------------------------------------------
     Mobile menu
     ----------------------------------------------------------------------- */
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const main = document.querySelector("main");
  const footer = document.querySelector(".site-footer");
  const mobileLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll("a")) : [];

  if (mobileMenu && "inert" in mobileMenu) {
    mobileMenu.inert = true;
  }

  const setMenuOpen = (open, restoreFocus = false) => {
    if (!menuToggle || !mobileMenu) return;

    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    document.body.classList.toggle("menu-open", open);

    if ("inert" in mobileMenu) mobileMenu.inert = !open;
    if (main && "inert" in main) main.inert = open;
    if (footer && "inert" in footer) footer.inert = open;

    if (open) {
      window.setTimeout(() => {
        if (mobileLinks[0]) mobileLinks[0].focus({ preventScroll: true });
      }, 80);
    } else if (restoreFocus) {
      menuToggle.focus({ preventScroll: true });
    }
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false, true));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (menuToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false, true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 920 && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
      }
    });
  }

  /* -----------------------------------------------------------------------
     In-page navigation focus
     ----------------------------------------------------------------------- */
  window.addEventListener("hashchange", () => {
    const id = window.location.hash.slice(1);
    if (!id || id === "top") return;

    const target = document.getElementById(id);
    if (!target || target.tagName !== "SECTION") return;

    const heading = target.querySelector("h2, h3");
    if (!heading) return;

    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  });

  /* -----------------------------------------------------------------------
     Active navigation
     ----------------------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const navSections = Array.from(document.querySelectorAll("main section[id]"));

  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      const active = link.dataset.nav === id;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if ("IntersectionObserver" in window && navSections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          const inNav = navLinks.some((link) => link.dataset.nav === id);
          setActiveNav(inNav ? id : "");
        });
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: 0 }
    );

    navSections.forEach((section) => navObserver.observe(section));
  }

  /* -----------------------------------------------------------------------
     Product interface tabs
     ----------------------------------------------------------------------- */
  const interfaces = {
    "plan-library": {
      index: "01",
      image: "assets/app-plan-library.png",
      alt: "TrainPhase 计划库当前界面",
      width: 390,
      height: 844,
      path: "计划入口",
      title: "计划库",
      summary: "从 76 套计划模板开始，按目标与难度筛选；也可以直接制定自己的计划。",
      facts: ["76 套内置计划模板", "初级 / 中级 / 高级筛选", "计划卡片直接进入详情", "支持制定自己的计划"],
      note: "计划库是计划进入系统的起点；模板提供规则，激活后才会生成独立的运行实例。",
    },
    "plan-editor": {
      index: "02",
      image: "assets/app-plan-editor.png",
      alt: "TrainPhase 计划编辑当前界面",
      width: 390,
      height: 844,
      path: "周期结构",
      title: "计划编辑",
      summary: "在周期、周、训练日和动作处方之间切换，实时查看构建检查、周期负荷与总组数。",
      facts: ["构建检查 80 分", "周期负荷与周结构图", "4 天 / 6 动作位 / 25 组", "结构修改可撤销"],
      note: "计划编辑输出计划定义；验证通过并激活后，才生成可执行的运行实例。",
    },
    "action-library": {
      index: "03",
      image: "assets/app-action-library.png",
      alt: "TrainPhase 动作库当前界面",
      width: 390,
      height: 844,
      path: "训练资源",
      title: "动作库",
      summary: "1116 个动作，按主项、变式、器械和肌群快速筛选。",
      facts: ["1116 个动作", "主项 / 变式 / 辅助", "器械与肌群标签", "进入动作详情"],
      note: "动作库为计划编辑和训练日提供可复用的动作资源。",
    },
    "action-stats": {
      index: "04",
      image: "assets/app-action-stats.png",
      alt: "TrainPhase 动作统计当前界面",
      width: 390,
      height: 1400,
      path: "分析 / 动作",
      title: "动作统计",
      summary: "把历史训练汇总成动作表现：训练次数、完成组、总容量、e1RM、PR 与下周建议。",
      facts: ["近 28 天训练 / 组数 / 容量", "动作列表与周容量", "e1RM 与 PR 记录", "疲劳解释与下周建议"],
      note: "动作统计从已完成训练生成，不修改历史；建议只作为下一次处方参考。",
    },
    "training-history": {
      index: "05",
      image: "assets/app-training-history.png",
      alt: "TrainPhase 训练历史当前界面",
      width: 390,
      height: 1200,
      path: "训练记录",
      title: "训练历史",
      summary: "按记录与日历回看每次训练，查看正式组、容量、e1RM、RPE 和完成状态。",
      facts: ["记录 / 日历视图", "每周训练负荷", "每次训练的动作明细", "PR / 高疲劳标记"],
      note: "历史保存实际表现；计划编辑和下一次处方不会覆盖已完成训练。",
    },
    "dup-builder": {
      index: "06",
      image: "assets/app-dup-builder.png",
      alt: "TrainPhase DUP 调度器当前界面",
      width: 390,
      height: 1400,
      path: "专业构建",
      title: "DUP 调度",
      summary: "通过周内强度与容量波动组织训练，实时看到基准、日卡与实际周期负荷。",
      facts: ["4 天 / 4 周波动", "D1–D4 强度与容量", "实际周期负荷预览", "0 项待补即可生成"],
      note: "DUP 调度器输出计划定义；验证后进入同一计划运行链。",
    },
  };

  const tabs = Array.from(document.querySelectorAll("[data-interface]"));
  const interfaceImage = document.getElementById("interface-image");
  const interfacePath = document.getElementById("interface-path");
  const interfaceTitle = document.getElementById("interface-title");
  const interfaceSummary = document.getElementById("interface-summary");
  const interfaceFacts = document.getElementById("interface-facts");
  const interfaceNote = document.getElementById("interface-note");
  const interfaceCount = document.getElementById("interface-count");
  const screenViewport = document.getElementById("screen-viewport");
  const interfacePanel = document.getElementById("interface-panel");
  let activeInterface = "plan-library";

  const renderInterface = (id, moveFocus = false) => {
    const item = interfaces[id];
    if (!item || !tabs.length) return;

    activeInterface = id;
    tabs.forEach((tab) => {
      const active = tab.dataset.interface === id;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && interfacePanel) interfacePanel.setAttribute("aria-labelledby", tab.id);
      if (active && moveFocus) tab.focus({ preventScroll: true });
    });

    if (interfaceImage) {
      interfaceImage.classList.add("is-switching");
      interfaceImage.src = item.image;
      interfaceImage.alt = item.alt;
      interfaceImage.width = item.width;
      interfaceImage.height = item.height;
      const reveal = () => interfaceImage.classList.remove("is-switching");
      interfaceImage.addEventListener("load", reveal, { once: true });
      window.setTimeout(reveal, 700);
    }

    if (interfacePath) interfacePath.textContent = item.path;
    if (interfaceTitle) interfaceTitle.textContent = item.title;
    if (interfaceSummary) interfaceSummary.textContent = item.summary;
    if (interfaceNote) interfaceNote.textContent = item.note;
    if (interfaceCount) interfaceCount.textContent = `${item.index} / 06`;

    if (interfaceFacts) {
      interfaceFacts.replaceChildren(
        ...item.facts.map((fact) => {
          const element = document.createElement("div");
          element.className = "interface-fact";
          element.textContent = fact;
          return element;
        })
      );
    }

    if (screenViewport) screenViewport.scrollTop = 0;
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => renderInterface(tab.dataset.interface));
  });

  const tablist = document.querySelector(".workbench-tabs");
  if (tablist) {
    tablist.addEventListener("keydown", (event) => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;

      event.preventDefault();
      const currentIndex = tabs.findIndex((tab) => tab.dataset.interface === activeInterface);
      let nextIndex = currentIndex;

      if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;

      const nextTab = tabs[nextIndex];
      if (nextTab) renderInterface(nextTab.dataset.interface, true);
    });
  }

  /* -----------------------------------------------------------------------
     Connection demo
     ----------------------------------------------------------------------- */
  const labStates = [
    {
      id: "setup",
      state: "安装组件",
      step: "STEP 01 / 04",
      title: "准备 TrainPhase AI Bridge",
      description: "安装本机连接组件，再为你常用的 AI 助手添加 TrainPhase。",
      button: "模拟完成安装",
    },
    {
      id: "waiting",
      state: "等待助手",
      step: "STEP 02 / 04",
      title: "在外部 AI 助手中发起请求",
      description: "例如输入：使用 TrainPhase 读取我的当前训练计划摘要。",
      button: "模拟 Agent 请求",
    },
    {
      id: "request",
      state: "等待确认",
      step: "STEP 03 / 04",
      title: "回到 H5 确认连接",
      description: "核对助手名称、设备和请求内容，然后允许本次连接。",
      button: "允许本次连接",
      request: true,
    },
    {
      id: "connected",
      state: "连接完成",
      step: "STEP 04 / 04",
      title: "可以开始询问训练",
      description: "AI 助手现在可以读取已允许的信息，并基于你的训练给出建议。",
      button: "结束演示",
      activity: true,
    },
  ];

  const lab = document.getElementById("agent-demo");
  const labState = document.getElementById("lab-state");
  const labStep = document.getElementById("lab-step");
  const labTitle = document.getElementById("lab-title");
  const labDescription = document.getElementById("lab-description");
  const labRequest = document.getElementById("lab-request");
  const labActivity = document.getElementById("lab-activity");
  const labPrimary = document.getElementById("lab-primary");
  const labReset = document.getElementById("lab-reset");
  const labProgress = Array.from(document.querySelectorAll(".lab-progress li"));
  let labIndex = 0;

  const renderLab = () => {
    const current = labStates[labIndex];
    if (!current) return;

    if (lab) lab.dataset.demoState = current.id;
    if (labState) labState.textContent = current.state;
    if (labStep) labStep.textContent = current.step;
    if (labTitle) labTitle.textContent = current.title;
    if (labDescription) labDescription.textContent = current.description;
    if (labPrimary) labPrimary.textContent = current.button;
    if (labRequest) labRequest.hidden = !current.request;
    if (labActivity) labActivity.hidden = !current.activity;

    labProgress.forEach((item, index) => {
      item.classList.toggle("is-done", index < labIndex);
      item.classList.toggle("is-active", index === labIndex);
      if (index === labIndex) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  };

  if (labPrimary && lab) {
    labPrimary.addEventListener("click", () => {
      labIndex = labIndex === labStates.length - 1 ? 0 : labIndex + 1;
      renderLab();
    });
  }

  if (labReset && lab) {
    labReset.addEventListener("click", () => {
      labIndex = 0;
      renderLab();
      if (labPrimary) labPrimary.focus();
    });
  }

  if (lab) renderLab();

  /* -----------------------------------------------------------------------
     Copy configuration
     ----------------------------------------------------------------------- */
  const copyButtons = Array.from(document.querySelectorAll("[data-copy-target]"));

  const copyWithFallback = (value) => {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    field.remove();
    return copied;
  };

  copyButtons.forEach((button) => {
    const defaultLabel = button.textContent;
    let resetTimer;

    button.setAttribute("aria-live", "polite");

    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;

      const value = target.textContent.trim();
      let copied = false;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
          copied = true;
        } else {
          copied = copyWithFallback(value);
        }
      } catch (error) {
        copied = copyWithFallback(value);
      }

      window.clearTimeout(resetTimer);
      button.textContent = copied ? "已复制" : "请手动复制";
      resetTimer = window.setTimeout(() => {
        button.textContent = defaultLabel;
      }, 2200);
    });
  });

  /* -----------------------------------------------------------------------
     Reveal on scroll
     ----------------------------------------------------------------------- */
  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  revealItems.forEach((item) => {
    const delay = Number(item.dataset.delay || 0);
    if (delay) item.style.setProperty("--delay", `${delay}ms`);
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* -----------------------------------------------------------------------
     Footer year
     ----------------------------------------------------------------------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  window.__trainphaseSiteReady = true;
})();
