import { renderAll } from "../app.js";
import { storage } from "../storage.js";
import { state } from "../state.js";
import { utils } from "../utils.js";

export function renderAkunTab() {
  const container = document.getElementById("akun-tab");
  container.innerHTML = `
        <section class="grid grid-cols-1 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-xl text-center font-bold mb-2">Manajemen Kategori</h3>
                <div class="space-y-6">
                    <div class="border rounded-md p-4 bg-gray-50">
                        <h4 class="font-medium  mb-2">Daftar Akun</h4>
                        <form id="add-akun-form" class="flex gap-2 mb-4">
                            <input type="text" id="new-akun-name" placeholder="Nama Akun Baru" class="grow block w-full rounded-md border-gray-300 shadow-sm" required>
                            <select id="new-akun-tipe" class="rounded-md border-gray-300 shadow-sm"> <option value="Aset">Aset</option><option value="Liabilitas">Liabilitas</option><option value="Ekuitas">Ekuitas</option><option value="Pendapatan">Pendapatan</option><option value="Beban">Beban</option> </select>
                            <button type="submit" class="py-2 px-3 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"><i class="fas fa-plus"></i></button>
                        </form>
                        <ul id="akun-list" class="space-y-2 max-h-48 overflow-y-auto pr-2"></ul>
                    </div>
                    <div class="border rounded-md p-4 bg-gray-50">
                        <h4 class="font-medium mb-2">Daftar Kelompok</h4>
                        <form id="add-kelompok-form" class="flex gap-2 mb-4">
                            <input type="text" id="new-kelompok-name" placeholder="Nama Kelompok Baru" class="grow block w-full rounded-md border-gray-300 shadow-sm" required>
                            <button type="submit" class="py-2 px-3 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"><i class="fas fa-plus"></i></button>
                        </form>
                        <ul id="kelompok-list" class="space-y-2 max-h-48 overflow-y-auto pr-2"></ul>
                    </div>
                </div>
            </div>
        </section>`;

  renderSettingLists();
  attachSettingsListeners();
}
function renderSettingLists() {
  const akunList = document.getElementById("akun-list");
  if (!akunList) return;
  akunList.innerHTML = "";
  state.settings.akuns
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((akun) => {
      akunList.innerHTML += `<li class="flex justify-between items-center bg-gray-50 p-2 rounded-md"><div>${akun.name}<span class="text-xs text-gray-500 ml-2 px-1.5 py-0.5 bg-gray-200 rounded-full">${akun.type}</span></div><button data-action="deleteAkun" data-name="${akun.name}" class="text-gray-400 hover:text-red-500 text-xs"><i class="fas fa-times-circle"></i></button></li>`;
    });

  const kelompokList = document.getElementById("kelompok-list");
  kelompokList.innerHTML = "";
  state.settings.kelompoks.sort().forEach((k) => {
    kelompokList.innerHTML += `<li class="flex justify-between items-center bg-gray-50 p-2 rounded-md"><span>${k}</span><button data-action="deleteKelompok" data-name="${k}" class="text-gray-400 hover:text-red-500 text-xs"><i class="fas fa-times-circle"></i></button></li>`;
  });
}

function attachSettingsListeners() {
  document.getElementById("add-akun-form").addEventListener("submit", (e) => {
    e.preventDefault();
    addAkun();
  });
  document
    .getElementById("add-kelompok-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      addKelompok();
    });

  // Delegation for delete buttons
  document.getElementById("akun-list").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn && btn.dataset.action === "deleteAkun") {
      deleteAkun(btn.dataset.name);
    }
  });
  document.getElementById("kelompok-list").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn && btn.dataset.action === "deleteKelompok") {
      deleteKelompok(btn.dataset.name);
    }
  });

  document
    .getElementById("btn-save-current")
    .addEventListener("click", () => storage.saveDataForCurrentMonth());
  document
    .getElementById("btn-load-month")
    .addEventListener("click", () => showLoadModal());
  // document.getElementById("btn-gen-pdf").addEventListener("click", () => pdfService.generatePDF());

  document
    .getElementById("btn-import")
    .addEventListener("click", () => storage.importData());
  document
    .getElementById("btn-export")
    .addEventListener("click", () => storage.exportData());
  document
    .getElementById("btn-reset")
    .addEventListener("click", () => resetData());
}

function addAkun() {
  const nameInput = document.getElementById("new-akun-name");
  const typeInput = document.getElementById("new-akun-tipe");
  const name = nameInput.value.trim();
  if (!name) return;
  if (
    state.settings.akuns.some(
      (a) => a.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    utils.showModal("Peringatan", "Nama akun sudah ada.");
    return;
  }
  state.settings.akuns.push({ name, type: typeInput.value });
  storage.saveData();
  renderSettingLists();
  nameInput.value = "";
  utils.showModal("Sukses", "Akun baru berhasil ditambahkan.");
}

function deleteAkun(name) {
  utils.showModal(
    "Konfirmasi Hapus",
    `Hapus akun "${name}"? Ini tidak akan menghapus transaksi yang sudah ada yang menggunakan akun ini.`,
    [
      {
        text: "Ya, Hapus",
        class: "bg-red-600 hover:bg-red-700",
        callback: () => {
          state.settings.akuns = state.settings.akuns.filter(
            (a) => a.name !== name,
          );
          storage.saveData();
          renderSettingLists();
          utils.closeModal();
        },
      },
      {
        text: "Batal",
        class: "bg-gray-600 hover:bg-gray-700",
        callback: () => utils.closeModal(),
      },
    ],
  );
}

function addKelompok() {
  const nameInput = document.getElementById("new-kelompok-name");
  const name = nameInput.value.trim();
  if (!name) return;
  if (
    state.settings.kelompoks.some((k) => k.toLowerCase() === name.toLowerCase())
  ) {
    utils.showModal("Peringatan", "Nama kelompok sudah ada.");
    return;
  }
  state.settings.kelompoks.push(name);
  storage.saveData();
  renderSettingLists();
  nameInput.value = "";
  utils.showModal("Sukses", "Kelompok baru berhasil ditambahkan.");
}

function deleteKelompok(name) {
  utils.showModal("Konfirmasi Hapus", `Hapus kelompok "${name}"?`, [
    {
      text: "Ya, Hapus",
      class: "bg-red-600 hover:bg-red-700",
      callback: () => {
        state.settings.kelompoks = state.settings.kelompoks.filter(
          (k) => k !== name,
        );
        storage.saveData();
        renderSettingLists();
        utils.closeModal();
      },
    },
    {
      text: "Batal",
      class: "bg-gray-600 hover:bg-gray-700",
      callback: () => utils.closeModal(),
    },
  ]);
}
