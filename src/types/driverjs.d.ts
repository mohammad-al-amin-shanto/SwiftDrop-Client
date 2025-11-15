declare module "driver.js" {
  interface IDriverStep {
    element?: string | HTMLElement;
    popover?: {
      title?: string;
      description?: string;
      position?: "top" | "left" | "right" | "bottom" | "auto";
      open?: boolean;
    };
    stageBackground?: string;
    onNext?: () => void;
    onPrevious?: () => void;
    onClick?: () => void;
    closeOnClickOutside?: boolean;
  }

  interface IDriverOptions {
    animate?: boolean;
    doneBtnText?: string;
    closeBtnText?: string;
    stageBackground?: string;
    onHighlightStarted?: (element: HTMLElement) => void;
    onReset?: () => void;
    overlayClickNext?: boolean;
    keyboardControl?: boolean;
  }

  export default class Driver {
    constructor(opts?: IDriverOptions);
    defineSteps(steps: IDriverStep[]): void;
    start(index?: number): void;
    reset(): void;
    highlight(element: HTMLElement | string): void;
  }
}
