import { ErrorMessage, type FieldProps, FastField } from 'formik';
import { cn } from '@/lib/utils';
import { Label } from '../../ui/label';
import { memo, type ReactNode } from 'react';

interface FormikCheckboxInputProps {
  name: string;
  label: string | ReactNode;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormikCheckboxInput = ({
  name,
  label,
  className,
  required,
  disabled = false,
}: FormikCheckboxInputProps) => {
  return (
    <>
      <div className="tw-checkbox-wrap flex items-start gap-2">
        <FastField name={name} type="checkbox">
          {({ field }: FieldProps) => (
            <input
              {...field}
              id={name}
              type="checkbox"
              className={cn('form-checkbox text-primary h-5 w-5', className)}
              disabled={disabled}
            />
          )}
        </FastField>

        <Label htmlFor={name} className="cursor-pointer text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      </div>
      <ErrorMessage name={name} component="p" className="mt-1 mb-4 text-sm text-red-500" />
    </>
  );
};

export default memo(FormikCheckboxInput);
