const storageMock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ""),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

Object.defineProperty(window, "localStorage", { value: storageMock() });
Object.defineProperty(window, "sessionStorage", { value: storageMock() });
Object.defineProperty(window, "getComputedStyle", {
  value: () => ["-webkit-appearance"],
});

Object.defineProperty(document.body.style, "transform", {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

Object.defineProperty(window, "getComputedStyle", {
  value: () => ({
    getPropertyValue: (prop: unknown) => {
      return "";
    },
  }),
});

Object.defineProperty(window, "matchMedia", {
  value: (query: unknown) => {
    return {
      matches: false,
      media: query,
      onchange: null as unknown,
      addListener: () => {},
      removeListener: () => {},
    };
  },
});
