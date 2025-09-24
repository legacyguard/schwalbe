
import React from 'react';
import {
  Adapt,
  getFontSize,
  Label,
  Sheet,
  styled,
  Select as TamaguiSelect,
  type SelectProps as TamaguiSelectProps,
  YStack,
} from '@tamagui/core';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

// Select trigger styling
const StyledSelectTrigger = styled(TamaguiSelect.Trigger, {
  name: 'SelectTrigger',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '$background',
  borderWidth: 2,
  borderColor: '$gray4',
  borderRadius: '$3',
  paddingHorizontal: '$3',
  animation: 'quick',

  variants: {
    size: {
      sm: {
        height: 36,
        paddingHorizontal: '$2',
        fontSize: '$3',
      },
      md: {
        height: 44,
        paddingHorizontal: '$3',
        fontSize: '$4',
      },
      lg: {
        height: 52,
        paddingHorizontal: '$4',
        fontSize: '$5',
      },
    },

    variant: {
      primary: {
        focusStyle: {
          borderColor: '$primaryBlue',
          outlineWidth: 2,
          outlineColor: '$primaryBlueLight',
          outlineStyle: 'solid',
        },
        hoverStyle: {
          borderColor: '$primaryBlueLight',
        },
      },
      success: {
        focusStyle: {
          borderColor: '$primaryGreen',
          outlineWidth: 2,
          outlineColor: '$primaryGreenLight',
          outlineStyle: 'solid',
        },
        hoverStyle: {
          borderColor: '$primaryGreenLight',
        },
      },
      premium: {
        focusStyle: {
          borderColor: '$accentGold',
          outlineWidth: 2,
          outlineColor: '$accentGoldLight',
          outlineStyle: 'solid',
        },
        hoverStyle: {
          borderColor: '$accentGoldLight',
        },
      },
    },

    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },

    error: {
      true: {
        borderColor: '$error',
      },
    },
  },

  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

// Select value text
const StyledSelectValue = styled(TamaguiSelect.Value, {
  name: 'SelectValue',
  color: '$color',
});

// Select content container
const StyledSelectContent = styled(TamaguiSelect.Content, {
  name: 'SelectContent',
  backgroundColor: '$background',
  borderRadius: '$3',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
});

// Select viewport
const StyledSelectViewport = styled(TamaguiSelect.Viewport, {
  name: 'SelectViewport',
  padding: '$2',
});

// Select item
const StyledSelectItem = styled(TamaguiSelect.Item, {
  name: 'SelectItem',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$2',
  animation: 'quick',

  hoverStyle: {
    backgroundColor: '$gray2',
  },

  pressStyle: {
    backgroundColor: '$gray3',
  },

  focusStyle: {
    backgroundColor: '$gray2',
    outlineWidth: 2,
    outlineColor: '$primaryBlueLight',
    outlineStyle: 'solid',
  },

  variants: {
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
});

// Select option type
export interface SelectOption {
  disabled?: boolean;
  label: string;
  value: string;
}

// Select props
export interface SelectProps
  extends Omit<TamaguiSelectProps, 'children' | 'size'> {
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
  helperText?: string;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'lg' | 'md' | 'sm';
  testID?: string;
  variant?: 'premium' | 'primary' | 'success';
}

// Main Select component
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      placeholder = 'Select an option',
      size = 'md',
      variant = 'primary',
      disabled = false,
      error = false,
      label,
      helperText,
      errorText,
      value,
      defaultValue,
      onValueChange,
      ...props
    },
    ref
  ) => {

    return (
      <YStack gap='$2'>
        {label && (
          <Label
            htmlFor={props.id}
            fontSize={size === 'sm' ? '$3' : '$4'}
            color='$color'
          >
            {label}
          </Label>
        )}

        <TamaguiSelect
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          {...props}
        >
          <StyledSelectTrigger
            ref={ref}
            size={size}
            variant={variant}
            disabled={disabled}
            error={error}
            iconAfter={ChevronDown}
          >
            <StyledSelectValue placeholder={placeholder} />
          </StyledSelectTrigger>

          <Adapt when='sm' platform='touch'>
            <Sheet
              native
              modal
              dismissOnSnapToBottom
              animationConfig={{
                type: 'spring',
                damping: 20,
                mass: 1.2,
                stiffness: 250,
              }}
            >
              <Sheet.Frame>
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay
                animation='lazy'
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
            </Sheet>
          </Adapt>

          <StyledSelectContent zIndex={200000}>
            <TamaguiSelect.ScrollUpButton
              alignItems='center'
              justifyContent='center'
              position='relative'
              width='100%'
              height='$3'
            >
              <YStack zIndex={10}>
                <ChevronUp size={20} />
              </YStack>
            </TamaguiSelect.ScrollUpButton>

            <StyledSelectViewport minWidth={200}>
              <TamaguiSelect.Group>
                {options.map((option, index) => (
                  <StyledSelectItem
                    key={option.value}
                    index={index}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    <TamaguiSelect.ItemText>
                      {option.label}
                    </TamaguiSelect.ItemText>
                    <TamaguiSelect.ItemIndicator marginLeft='auto'>
                      <Check size={16} />
                    </TamaguiSelect.ItemIndicator>
                  </StyledSelectItem>
                ))}
              </TamaguiSelect.Group>
            </StyledSelectViewport>

            <TamaguiSelect.ScrollDownButton
              alignItems='center'
              justifyContent='center'
              position='relative'
              width='100%'
              height='$3'
            >
              <YStack zIndex={10}>
                <ChevronDown size={20} />
              </YStack>
            </TamaguiSelect.ScrollDownButton>
          </StyledSelectContent>
        </TamaguiSelect>

        {(helperText || errorText) && (
          <Label fontSize='$2' color={error ? '$error' : '$gray6'}>
            {error ? errorText : helperText}
          </Label>
        )}
      </YStack>
    );
  }
);

Select.displayName = 'Select';

// Native Select component (for better mobile UX)
export const NativeSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      size = 'medium',
      disabled = false,
      error = false,
      label,
      helperText,
      errorText,
      value,
      defaultValue,
      onValueChange,
      ...props
    },
    ref
  ) => {

    return (
      <YStack gap='$2'>
        {label && (
          <Label
            htmlFor={props.id}
            fontSize={size === 'small' ? '$3' : '$4'}
            color='$color'
          >
            {label}
          </Label>
        )}

        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          value={value}
          defaultValue={defaultValue}
          onChange={e => onValueChange?.(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            height: size === 'small' ? 36 : size === 'medium' ? 44 : 52,
            fontSize: getFontSize(
              size === 'small' ? '$3' : size === 'medium' ? '$4' : '$5'
            ),
            padding: '0 12px',
            borderRadius: 8,
            border: `2px solid ${error ? 'var(--error)' : 'var(--gray4)'}`,
            backgroundColor: 'var(--background)',
            color: 'var(--color)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
          {...props}
        >
          {placeholder && (
            <option value='' disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {(helperText || errorText) && (
          <Label fontSize='$2' color={error ? '$error' : '$gray6'}>
            {error ? errorText : helperText}
          </Label>
        )}
      </YStack>
    );
  }
);

NativeSelect.displayName = 'NativeSelect';
