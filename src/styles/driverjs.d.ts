// declare module "driver.js" {
//   export interface IDriverStep {
//     element?: string | HTMLElement;
//     popover?: {
//       title?: string;
//       description?: string;
//       position?: "top" | "left" | "right" | "bottom" | "auto";
//       open?: boolean;
//     };
//     stageBackground?: string;
//     onNext?: () => void;
//     onPrevious?: () => void;
//     onClick?: () => void;
//     closeOnClickOutside?: boolean;
//   }

//   export interface IDriverOptions {
//     animate?: boolean;
//     doneBtnText?: string;
//     closeBtnText?: string;
//     stageBackground?: string;
//     onHighlightStarted?: (element: HTMLElement) => void;
//     onReset?: () => void;
//     overlayClickNext?: boolean;
//     keyboardControl?: boolean;
//   }

//   export class Driver {
//     constructor(opts?: IDriverOptions);
//     defineSteps(steps: IDriverStep[]): void;
//     start(index?: number): void;
//     reset(): void;
//     highlight(element: HTMLElement | string): void;
//   }
// }

declare module "driver.js" {
  export interface DriverPopover {
    title?: string;
    description?: string;
    position?: "top" | "left" | "right" | "bottom" | "auto";
    open?: boolean;
  }

  export interface DriverStep {
    element?: string | HTMLElement;
    popover?: DriverPopover;
    stageBackground?: string;
    onNext?: () => void;
    onPrevious?: () => void;
    onClick?: () => void;
    closeOnClickOutside?: boolean;
  }

  export interface DriverOptions {
    animate?: boolean;
    doneBtnText?: string;
    closeBtnText?: string;
    stageBackground?: string;
    onHighlightStarted?: (el: HTMLElement) => void;
    onReset?: () => void;
    overlayClickNext?: boolean;
    keyboardControl?: boolean;
    steps?: DriverStep[];
    showProgress?: boolean;
  }

  export function driver(opts?: DriverOptions): {
    drive(): void;
    destroy(): void;
  };
}
