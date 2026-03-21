document.addEventListener("DOMContentLoaded", async () => {
  const citySt = document.getElementById("checkoutCity");
  const distSt = document.getElementById("checkoutDistrict");
  if (!citySt || !distSt) return;

  try {
    const res = await fetch("https://provinces.open-api.vn/api/?depth=2");
    const data = await res.json();

    citySt.innerHTML =
      `<option value="">Chọn Tỉnh/Thành phố</option>` +
      data.map((p) => `<option value="${p.name}">${p.name}</option>`).join("");

    citySt.addEventListener("change", (e) => {
      const p = data.find((x) => x.name === e.target.value);
      distSt.innerHTML =
        `<option value="">Chọn Quận/Huyện</option>` +
        (p
          ? p.districts
              .map((d) => `<option value="${d.name}">${d.name}</option>`)
              .join("")
          : "");
      distSt.disabled = !p;
    });
  } catch (err) {
    console.error("Lỗi API tỉnh thành:", err);
  }
});
