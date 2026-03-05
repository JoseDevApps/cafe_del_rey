export default function GeovisorPage() {
  return (
    <iframe
      src={"https://geoportal.mhe.gob.bo/maps/794/embed"}
      className="h-[70vh] w-full rounded-xl border"
      loading="lazy"
      referrerPolicy="no-referrer"
      allow="fullscreen"
    />
  )
}