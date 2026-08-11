import { InputHTMLAttributes } from 'react';
import { extraireChiffres, formatNombreSaisi } from '../lib/format';

interface MontantInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onChange: (chiffres: string) => void;
}

/** Champ de saisie de montant affichant un séparateur de milliers pendant la frappe. */
export function MontantInput({ value, onChange, className, ...props }: MontantInputProps) {
  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={formatNombreSaisi(value)}
      onChange={(e) => onChange(extraireChiffres(e.target.value))}
      className={className}
    />
  );
}
