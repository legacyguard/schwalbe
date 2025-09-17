
// Export Alert components
export {
  Alert,
  AlertBox,
  type AlertBoxProps,
  AlertCloseButton,
  AlertDescription,
  type AlertDescriptionProps,
  AlertIcon,
  type AlertProps,
  AlertTitle,
  type AlertTitleProps,
} from './components/Alert';
// Export Badge components
export {
  Badge,
  BadgeDot,
  type BadgeDotProps,
  BadgeGroup,
  type BadgeGroupProps,
  type BadgeProps,
  BadgeText,
  type BadgeTextProps,
  BadgeWithIcon,
  type BadgeWithIconProps,
} from './components/Badge';

// Export Button components
export {
  Button,
  type ButtonProps,
  IconButton,
  type IconButtonProps,
} from './components/Button';

// Export Card components
export {
  Card,
  CardContent,
  type CardContentProps,
  CardDescription,
  type CardDescriptionProps,
  CardFooter,
  type CardFooterProps,
  CardHeader,
  type CardHeaderProps,
  type CardProps,
  CardTitle,
  type CardTitleProps,
} from './components/Card';

export {
  Checkbox,
  CheckboxGroup,
  type CheckboxGroupProps,
  type CheckboxProps,
} from './components/Checkbox';

// Export ErrorBoundary components
export {
  type FallbackProps,
  GlobalErrorBoundary,
  type GlobalErrorBoundaryProps,
} from './components/ErrorBoundary';

// Export Form components
export {
  FormField,
  type FormFieldProps,
  FormInput,
  type FormInputProps,
  FormRow,
  type FormRowProps,
  FormSection,
  type FormSectionProps,
  FormSelect,
  type FormSelectProps,
  FormTextArea,
  type FormTextAreaProps,
  validateField,
  ValidationPatterns,
} from './components/forms';

// Export Input components
export {
  Input,
  InputError,
  type InputErrorProps,
  InputGroup,
  type InputGroupProps,
  InputHelper,
  type InputHelperProps,
  InputLabel,
  type InputLabelProps,
  type InputProps,
  TextArea,
  type TextAreaProps,
} from './components/Input';

// Export Layout components
export {
  Box,
  type BoxProps,
  Container,
  type ContainerProps,
  Divider,
  type DividerProps,
  Grid,
  type GridProps,
  Row,
  type RowProps,
  ScrollContainer,
  type ScrollContainerProps,
  Section,
  type SectionProps,
  Spacer,
  type SpacerProps,
  Stack,
  type StackProps,
  XStack,
  type XStackProps,
  YStack,
  type YStackProps,
} from './components/Layout';

// Export Garden and Firefly components
export { LegacyGarden } from './components/LegacyGarden';

// Export ProgressBar components
export {
  CircularProgress,
  type CircularProgressProps,
  ProgressBar,
  ProgressBarContainer,
  type ProgressBarProps,
  ProgressFill,
  ProgressTrack,
  SegmentedProgress,
  type SegmentedProgressProps,
} from './components/ProgressBar';

export {
  RadioButton,
  type RadioButtonProps,
  RadioGroup,
  type RadioGroupProps,
  type RadioOption,
} from './components/RadioGroup';

export {
  NativeSelect,
  Select,
  type SelectOption,
  type SelectProps,
} from './components/Select';

// Export Skeleton components
export {
  Skeleton,
  SkeletonAvatar,
  type SkeletonAvatarProps,
  SkeletonButton,
  type SkeletonButtonProps,
  SkeletonCard,
  type SkeletonCardProps,
  SkeletonImage,
  type SkeletonImageProps,
  SkeletonList,
  type SkeletonListProps,
  type SkeletonProps,
  SkeletonText,
  type SkeletonTextProps,
} from './components/Skeleton';

export { SofiaFirefly } from './components/SofiaFirefly';

// Export Spinner component
export { Spinner, type SpinnerProps } from './components/Spinner';

// Export Form components
export { Switch, type SwitchProps } from './components/Switch';

// Export Typography components
export {
  Caption,
  type CaptionProps,
  H1,
  type H1Props,
  H2,
  type H2Props,
  H3,
  type H3Props,
  H4,
  type H4Props,
  H5,
  type H5Props,
  H6,
  type H6Props,
  Label,
  type LabelProps,
  Paragraph,
  type ParagraphProps,
  Span,
  type SpanProps,
} from './components/Typography';

// Export Animation constants
export {
  AnimationSpeed,
  ButtonAnimation,
  CardAnimation,
  ListAnimation,
  ModalAnimation,
  PageAnimation,
  PressAnimation,
  SkeletonAnimation,
  useAnimations,
} from './constants/animations';

// Export Dark Mode utilities
export { useDarkMode, withDarkMode } from './hooks/useDarkMode';

// Export configuration
export { config, tamaguiConfig } from './tamagui.config';

export type { AppConfig } from './tamagui.config';

// Export Event Bus utilities
export {
  eventBus,
  EVENTS,
  type EventType,
  useEventBus,
  useEventEmitter,
} from './utils/eventBus';

// Re-export Tamagui core components and utilities
export {
  AnimatePresence,
  Image,
  styled,
  TamaguiProvider,
  Text,
  Theme,
  useMedia,
  useTheme,
  View,
} from 'tamagui';
