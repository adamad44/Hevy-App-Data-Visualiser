export async function loadChartsModule() {
  const isMobile =
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    return await import("./charts-mobile.js");
  } else {
    return await import("./charts.js");
  }
}
