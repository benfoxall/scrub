import { get, set } from "idb-keyval";

const select = document.querySelector("#nav select");
const chooseFile = document.querySelector("#nav [type=file]");
const clearFile = document.querySelector("#clear");

const selected = select.value;

const key = "SELECTED";
const item = sessionStorage.getItem(key);

export function initUI() {
  get("file").then((d) => {
    if (d) {
      chooseFile.remove();
      clearFile.addEventListener("click", () => {
        set("file", undefined);
        location.reload();
      });
      clearFile.innerText = `× ${d.name}`;
    } else {
      clearFile.remove();
      chooseFile.addEventListener("change", async () => {
        await set("file", chooseFile.files[0]);
        location.reload();
      });
    }
  });

  const item = sessionStorage.getItem(key);
  if (item) {
    select.value = item;
  }
  select.addEventListener("change", async () => {
    sessionStorage.setItem(key, select.value);
    await set("file", undefined);
    location.reload();
  });
}

export const videoSrc = get("file").then((stored) =>
  stored
    ? URL.createObjectURL(stored)
    : new URL("../../videos/" + select.value, import.meta.url).href
);
