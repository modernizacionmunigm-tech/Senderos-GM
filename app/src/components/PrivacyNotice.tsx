/**
 * Aviso de privacidad mínimo, adaptado a la Ley 25.326.
 *
 * Contacto oficial de la Municipalidad para privacidad y bajas.
 */
const CONTACTO = 'modernizacion.munigm@gmail.com';

export default function PrivacyNotice({ dark = false }: { dark?: boolean }) {
  return (
    <details
      className={`text-[11px] leading-snug rounded-lg border px-3 py-2 ${
        dark
          ? 'border-white/20 bg-white/5 text-emerald-50'
          : 'border-gray-200 bg-gray-50/60 text-gray-600'
      }`}
    >
      <summary className="cursor-pointer font-bold select-none">
        Cómo usamos tus datos
      </summary>
      <div className="mt-2 space-y-1.5">
        <p>
          <strong>Responsable:</strong> Municipalidad de Guardia Mitre.
        </p>
        <p>
          <strong>Qué datos:</strong> nombre y apellido, sendero, tiempo, fecha,
          categoría, comentario opcional y email opcional.
        </p>
        <p>
          <strong>Qué se publica:</strong> tu primer nombre y las iniciales de las
          demás palabras (por ejemplo, “Daniela P.” o “Daniela P. G.”), sendero,
          tiempo, categoría y fecha. El comentario se publica
          <strong> sólo si Modernización lo aprueba</strong>. El email no se
          publica.
        </p>
        <p>
          <strong>Email:</strong> es opcional y sirve para verificar tu identidad
          si pedís borrar un tiempo o un comentario. No se usa para publicidad.
        </p>
        <p>
          <strong>Para qué:</strong> ranking deportivo y estadísticas del uso de
          los senderos. No se usan para publicidad ni se venden.
        </p>
        <p>
          <strong>Base:</strong> tu consentimiento, que podés retirar cuando
          quieras. Conservamos los datos mientras el ranking esté activo.
        </p>
        <p>
          <strong>Derechos:</strong> podés pedir acceso, rectificación o baja
          escribiendo a{' '}
          <a className="underline font-semibold" href={`mailto:${CONTACTO}`}>
            {CONTACTO}
          </a>
          .
        </p>
        <p>
          Si sos menor de edad, necesitás la autorización de un adulto
          responsable. El ranking publica tu nombre y la inicial de tu apellido.
        </p>
      </div>
    </details>
  );
}
