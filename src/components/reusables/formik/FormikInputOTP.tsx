import { ErrorMessage, type FieldProps, FastField } from 'formik';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'; // Adjust the import path as needed
import { Label } from '@/components/ui/label';
import { memo } from 'react';

interface FormikInputOTPProps {
  name: string;
  label?: string;
  length?: number;
  required?: boolean;
  className?: string;
}

const FormikInputOTP = ({
  name,
  label,
  length = 6,
  required = false,
  className,
}: FormikInputOTPProps) => {
  const group1Count = Math.floor(length / 2);
  const group2Count = length - group1Count;

  return (
    <div className="tw-input-wrap mb-4 grid w-full items-center">
      {label && (
        <Label htmlFor={name} className="mb-2 text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <FastField name={name}>
        {({ field, form }: FieldProps) => (
          <InputOTP
            id={name}
            maxLength={length}
            value={field.value || ''}
            onChange={(val) => form.setFieldValue(name, val)}
            onBlur={() => form.setFieldTouched(name, true)}
            containerClassName={className || 'justify-center'}
          >
            <InputOTPGroup>
              {Array.from({ length: group1Count }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>

            <InputOTPSeparator />

            <InputOTPGroup>
              {Array.from({ length: group2Count }).map((_, i) => (
                <InputOTPSlot key={i + group1Count} index={i + group1Count} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        )}
      </FastField>

      <ErrorMessage name={name} component="p" className="mt-1 text-center text-sm text-red-500" />
    </div>
  );
};

export default memo(FormikInputOTP);
