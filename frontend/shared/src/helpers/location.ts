export async function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  if (!navigator.geolocation) return null;

  if (navigator.permissions) {
    const { state } = await navigator.permissions.query({ name: "geolocation" });
    if (state === "denied") return null;
    // "granted" proceeds silently; "prompt" will show the browser dialog
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}
