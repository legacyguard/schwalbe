
// Type declarations for missing UI dependencies

declare module 'embla-carousel-react' {
  export interface EmblaCarouselType {
    canScrollNext: () => boolean;
    canScrollPrev: () => boolean;
    off: (event: string, callback: () => void) => void;
    on: (event: string, callback: () => void) => void;
    scrollNext: () => void;
    scrollPrev: () => void;
    scrollProgress: () => number;
    scrollTo: (index: number) => void;
    selectedScrollSnap: () => number;
  }

  export type UseEmblaCarouselType<T = HTMLElement> = [
    (node: null | T) => void,
    EmblaCarouselType
  ];

  export default function useEmblaCarousel<T = HTMLElement>(
    options?: Record<string, any>,
    plugins?: any[]
  ): UseEmblaCarouselType<T>;
}

declare module 'cmdk' {
  import type * as React from 'react';

  export interface CommandProps
    extends Omit<React.ComponentProps<'div'>, 'onValueChange'> {
    onValueChange?: (value: string) => void;
    value?: string;
  }

  export interface CommandInputProps extends React.ComponentProps<'input'> {}

  export interface CommandListProps extends React.ComponentProps<'div'> {}

  export interface CommandEmptyProps extends React.ComponentProps<'div'> {}

  export interface CommandGroupProps extends React.ComponentProps<'div'> {
    heading?: React.ReactNode;
  }

  export interface CommandItemProps extends React.ComponentProps<'div'> {
    disabled?: boolean;
    onSelect?: (value: string) => void;
    value?: string;
  }

  export interface CommandSeparatorProps extends React.ComponentProps<'div'> {}

  export interface CommandLoadingProps extends React.ComponentProps<'div'> {}

  export const Command: React.ForwardRefExoticComponent<
    CommandProps & React.RefAttributes<HTMLDivElement>
  > & {
    Empty: React.ForwardRefExoticComponent<
      CommandEmptyProps & React.RefAttributes<HTMLDivElement>
    >;
    Group: React.ForwardRefExoticComponent<
      CommandGroupProps & React.RefAttributes<HTMLDivElement>
    >;
    Input: React.ForwardRefExoticComponent<
      CommandInputProps & React.RefAttributes<HTMLInputElement>
    >;
    Item: React.ForwardRefExoticComponent<
      CommandItemProps & React.RefAttributes<HTMLDivElement>
    >;
    List: React.ForwardRefExoticComponent<
      CommandListProps & React.RefAttributes<HTMLDivElement>
    >;
    Loading: React.ForwardRefExoticComponent<
      CommandLoadingProps & React.RefAttributes<HTMLDivElement>
    >;
    Separator: React.ForwardRefExoticComponent<
      CommandSeparatorProps & React.RefAttributes<HTMLDivElement>
    >;
  };
}

declare module 'vaul' {

  export interface DrawerRootProps {
    children: React.ReactNode;
    direction?: 'bottom' | 'left' | 'right' | 'top';
    dismissible?: boolean;
    modal?: boolean;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
    shouldScaleBackground?: boolean;
  }

  export interface DrawerPortalProps {
    children: React.ReactNode;
    container?: HTMLElement;
  }

  export const Drawer: {
    Close: React.ForwardRefExoticComponent<
      React.ComponentProps<'button'> & React.RefAttributes<HTMLButtonElement>
    >;
    Content: React.ForwardRefExoticComponent<
      React.ComponentProps<'div'> & React.RefAttributes<HTMLDivElement>
    >;
    Description: React.ForwardRefExoticComponent<
      React.ComponentProps<'div'> & React.RefAttributes<HTMLDivElement>
    >;
    Footer: React.ForwardRefExoticComponent<
      React.ComponentProps<'div'> & React.RefAttributes<HTMLDivElement>
    >;
    Header: React.ForwardRefExoticComponent<
      React.ComponentProps<'div'> & React.RefAttributes<HTMLDivElement>
    >;
    Overlay: React.ForwardRefExoticComponent<
      React.ComponentProps<'div'> & React.RefAttributes<HTMLDivElement>
    >;
    Portal: React.ForwardRefExoticComponent<
      DrawerPortalProps & React.RefAttributes<HTMLDivElement>
    >;
    Root: React.ForwardRefExoticComponent<
      DrawerRootProps & React.RefAttributes<HTMLDivElement>
    >;
    Title: React.ForwardRefExoticComponent<
      React.ComponentProps<'div'> & React.RefAttributes<HTMLDivElement>
    >;
    Trigger: React.ForwardRefExoticComponent<
      React.ComponentProps<'button'> & React.RefAttributes<HTMLButtonElement>
    >;
  };
}
