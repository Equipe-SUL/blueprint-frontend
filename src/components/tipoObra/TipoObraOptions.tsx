const tipoObraOptions = [
  { value: 'eletrica', label: 'Elétrica' },
  { value: 'hidraulica', label: 'Hidráulica' },
  { value: 'alvenaria', label: 'Alvenaria' },
  { value: 'spda', label: 'SPDA' },
  { value: 'combate_a_incendio', label: 'Combate a Incêndio' },
]

export default function TipoObraOptions() {
  return (
    <div className="tipo-obra-options" aria-hidden="true">
      {tipoObraOptions.map((option) => (
        <span key={option.value} className="tipo-obra-option">
          {option.label}
        </span>
      ))}
    </div>
  )
}