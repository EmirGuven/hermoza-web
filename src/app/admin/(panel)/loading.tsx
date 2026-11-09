// Panel sayfaları oturum ve veritabanı okurken gösterilen iskelet
export default function Loading() {
  return (
    <div className="stack" aria-busy="true" aria-label="Yükleniyor">
      <div className="page-head">
        <div>
          <div style={{ width: 220, height: 22, background: "var(--hover)" }} />
          <div style={{ width: 340, height: 14, marginTop: 8, background: "var(--hover)" }} />
        </div>
      </div>
      <div className="card" style={{ height: 260, background: "var(--surface)" }} />
    </div>
  );
}
