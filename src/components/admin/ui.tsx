// Panelin basit, durumsuz bileşenleri (sunucu ve istemci tarafında kullanılabilir)

export function PageHead({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}

export function Card({
  title,
  sub,
  actions,
  flush,
  children,
}: {
  title?: string;
  sub?: string;
  actions?: React.ReactNode;
  flush?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`card ${flush ? "card--flush" : ""}`}>
      {(title || actions) && (
        <div className="card__head">
          <div>
            {title && <div className="card__title">{title}</div>}
            {sub && <div className="card__sub">{sub}</div>}
          </div>
          {actions}
        </div>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  hint,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className="input"
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </Field>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  hint,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea className="textarea" name={name} defaultValue={defaultValue} rows={rows} />
    </Field>
  );
}

export function Switch({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="row" style={{ gap: 10, cursor: "pointer" }}>
      <span className="switch">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
        <span className="switch__track" />
      </span>
      <span className="soft">{label}</span>
    </label>
  );
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(d));
}
