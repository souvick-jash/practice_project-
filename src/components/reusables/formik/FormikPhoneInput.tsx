import { FastField, type FieldProps } from 'formik';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Label } from '../../ui/label';
import { cn } from '@/lib/utils';
import { memo, type ReactNode } from 'react';
import { type CountryCode } from 'libphonenumber-js/core';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

interface FormikPhoneInputProps {
  name: string;
  label: string | ReactNode;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  defaultCountry?: CountryCode;
}

const FormikPhoneInput = ({
  name,
  label,
  placeholder = 'Enter phone number',
  className,
  required = false,
  disabled = false,
  defaultCountry = 'US',
}: FormikPhoneInputProps) => {
  return (
    <div className="tw-input-wrap mb-4 grid w-full items-center">
      <Label htmlFor={name} className="mb-2 text-base">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <FastField name={name}>
        {({ field, form }: FieldProps) => {
          const isTouched = form.touched[name];
          const value = field.value;

          return (
            <>
              <PhoneInput
                international
                defaultCountry={defaultCountry}
                id={name}
                value={value}
                onChange={(val) => {
                  const digitsOnly = (val ?? '').replace(/\D/g, '');

                  form.setFieldValue(name, val);

                  const parsed = val ? parsePhoneNumberFromString(val) : null;
                  const tooLong = digitsOnly.length > 15;

                  if (!parsed || !parsed.isValid() || tooLong) {
                    form.setFieldError(name, 'The Phone Number is invalid');
                  } else {
                    form.setFieldError(name, undefined);
                  }
                }}
                onBlur={() => {
                  form.setFieldTouched(name, true);
                }}
                placeholder={placeholder}
                disabled={disabled}
                className={cn('react-phone-input text-foreground', className)}
              />

              {isTouched && form.errors[name] && (
                <p className="mt-1 text-sm text-red-500">{form.errors[name] as string}</p>
              )}
            </>
          );
        }}
      </FastField>
    </div>
  );
};

export default memo(FormikPhoneInput);
