import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCcw,
  Pencil,
  Save,
  X,
  ImageOff,
  CheckCircle2,
  CircleSlash2,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { editMenuItem, getLatestMenu, syncMenu } from "../api";
import { CatalogItem, CatalogPayload } from "../types";

const placeholder =
  "https://static-00.iconduck.com/assets.00/image-off-icon-2048x2048-b89j8s5m.png";

type EditState = {
  [itemId: string]: {
    editing: boolean;
    value: string;
    saving: boolean;
  };
};

type CategoryGroup = {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
    items: CatalogItem[];
  }[];
  // items that have categoryId === this category but no subCategoryId
  uncategorizedItems: CatalogItem[];
};

export const ItemsManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [menu, setMenu] = useState<CatalogPayload | null>(null);
  const [editImage, setEditImage] = useState<EditState>({});
  const [search, setSearch] = useState("");
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);

  // collapsible UI state
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {}
  );
  const [openSubcats, setOpenSubcats] = useState<Record<string, boolean>>({});

  const loadLatest = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data: CatalogPayload = await getLatestMenu();
      setMenu(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load menu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  // Maps to resolve category/subcategory names
  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    const cats: any[] = (menu?.categories as any[]) || [];
    for (const c of cats) {
      if (c?.categoryId) map.set(c.categoryId, c.name || c.categoryId);
    }
    return map;
  }, [menu]);

  const subcategoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    const cats: any[] = (menu?.categories as any[]) || [];
    for (const c of cats) {
      const subs: any[] = c?.subCategories || [];
      for (const s of subs) {
        if (s?.subCategoryId)
          map.set(s.subCategoryId, s.name || s.subCategoryId);
      }
    }
    return map;
  }, [menu]);

  // Filtered items (search + out-of-stock)
  const filteredItems: CatalogItem[] = useMemo(() => {
    const list = menu?.items || [];
    const q = search.trim().toLowerCase();

    return list.filter((it) => {
      let ok = true;
      if (q) {
        ok =
          it.itemName.toLowerCase().includes(q) ||
          it.itemId.toLowerCase().includes(q) ||
          (it.description || "").toLowerCase().includes(q) ||
          (it.categoryId || "").toLowerCase().includes(q) ||
          (it.subCategoryId || "").toLowerCase().includes(q);
      }
      if (onlyOutOfStock) ok = ok && !Boolean(it.inStock);
      return ok;
    });
  }, [menu, search, onlyOutOfStock]);

  // Group items: Category -> Subcategory
  const groups: CategoryGroup[] = useMemo(() => {
    const byCat: Record<string, CategoryGroup> = {};

    for (const it of filteredItems) {
      const catId = it.categoryId || "__NO_CATEGORY__";
      if (!byCat[catId]) {
        byCat[catId] = {
          id: catId,
          name:
            catId === "__NO_CATEGORY__"
              ? "Uncategorized"
              : categoryNameById.get(catId) || catId,
          subcategories: [],
          uncategorizedItems: [],
        };
      }

      const subId = it.subCategoryId || "";
      if (!subId) {
        byCat[catId].uncategorizedItems.push(it);
      } else {
        let sub = byCat[catId].subcategories.find((s) => s.id === subId);
        if (!sub) {
          sub = {
            id: subId,
            name: subcategoryNameById.get(subId) || subId,
            items: [],
          };
          byCat[catId].subcategories.push(sub);
        }
        sub.items.push(it);
      }
    }

    // Sorting for a nicer UI
    const sortItems = (a: CatalogItem, b: CatalogItem) =>
      (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
      a.itemName.localeCompare(b.itemName);

    const catArr = Object.values(byCat);
    // Try to keep categories in the same order as the API if displayOrder exists
    catArr.sort((a, b) => a.name.localeCompare(b.name));
    for (const c of catArr) {
      c.subcategories.sort((a, b) => a.name.localeCompare(b.name));
      c.uncategorizedItems.sort(sortItems);
      for (const s of c.subcategories) {
        s.items.sort(sortItems);
      }
    }

    return catArr;
  }, [filteredItems, categoryNameById, subcategoryNameById]);

  const onToggleStock = async (item: CatalogItem) => {
    const next = !Boolean(item.inStock);
    try {
      // optimistic UI
      setMenu((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.itemId === item.itemId ? { ...i, inStock: next } : i
              ),
            }
          : prev
      );
      await editMenuItem(item.itemId, { inStock: next });
    } catch (e) {
      console.error(e);
      alert("Failed to update stock.");
      // revert if failed
      setMenu((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.itemId === item.itemId ? { ...i, inStock: !next } : i
              ),
            }
          : prev
      );
    }
  };

  const startEdit = (item: CatalogItem) => {
    setEditImage((prev) => ({
      ...prev,
      [item.itemId]: {
        editing: true,
        value: item.image || "",
        saving: false,
      },
    }));
    // auto-open the category/subcat containing this item for convenience
    if (item.categoryId) {
      setOpenCategories((prev) => ({ ...prev, [item.categoryId!]: true }));
    } else {
      setOpenCategories((prev) => ({ ...prev, __NO_CATEGORY__: true }));
    }
    if (item.subCategoryId) {
      setOpenSubcats((prev) => ({ ...prev, [item.subCategoryId!]: true }));
    }
  };

  const cancelEdit = (itemId: string) => {
    setEditImage((prev) => ({
      ...prev,
      [itemId]: { editing: false, value: "", saving: false },
    }));
  };

  const saveImage = async (item: CatalogItem) => {
    const state = editImage[item.itemId];
    if (!state) return;
    const url = state.value.trim();

    // optional basic validation
    if (url && !/^https?:\/\//i.test(url)) {
      if (!confirm("URL does not look like an http(s) URL. Save anyway?")) {
        return;
      }
    }

    setEditImage((prev) => ({
      ...prev,
      [item.itemId]: { ...prev[item.itemId], saving: true },
    }));

    try {
      await editMenuItem(item.itemId, { image: url });
      // update local list
      setMenu((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                i.itemId === item.itemId ? { ...i, image: url } : i
              ),
            }
          : prev
      );
      cancelEdit(item.itemId);
    } catch (e) {
      console.error(e);
      alert("Failed to update image.");
      setEditImage((prev) => ({
        ...prev,
        [item.itemId]: { ...prev[item.itemId], saving: false },
      }));
    }
  };

  const onSync = async () => {
    if (!confirm("Fetch latest menu from provider and save a new snapshot?")) {
      return;
    }
    setSyncing(true);
    try {
      await syncMenu();
      await loadLatest();
    } catch (e) {
      console.error(e);
      alert("Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const toggleCategoryOpen = (catId: string) =>
    setOpenCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  const toggleSubcatOpen = (subId: string) =>
    setOpenSubcats((prev) => ({ ...prev, [subId]: !prev[subId] }));

  const ItemCard: React.FC<{ it: CatalogItem }> = ({ it }) => {
    const edit = editImage[it.itemId];
    const imgSrc = it.image || placeholder;
    const stock = Boolean(it.inStock);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative">
          {it.image ? (
            <img
              src={imgSrc}
              alt={it.itemName}
              className="w-full h-40 object-cover"
              onError={(e) =>
                ((e.target as HTMLImageElement).src = placeholder)
              }
            />
          ) : (
            <div className="w-full h-40 bg-gray-50 flex items-center justify-center">
              <ImageOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-base font-semibold text-gray-900">
                {it.itemName}
              </div>
              <div className="text-xs text-gray-500 font-mono">{it.itemId}</div>
            </div>

            {/* Stock badge & toggle */}
            <button
              onClick={() => onToggleStock(it)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                stock
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
              title="Toggle stock"
            >
              {stock ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  In stock
                </>
              ) : (
                <>
                  <CircleSlash2 className="w-4 h-4" />
                  Out of stock
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <span className="text-gray-500">Price:</span>{" "}
              <span className="font-medium">₹ {it.price ?? 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>{" "}
              <span className="font-medium">{it.status}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Category:</span>{" "}
              <span className="font-medium">
                {categoryNameById.get(it.categoryId || "") ||
                  it.categoryId ||
                  "—"}
                {it.subCategoryId
                  ? ` / ${
                      subcategoryNameById.get(it.subCategoryId) ||
                      it.subCategoryId
                    }`
                  : ""}
              </span>
            </div>
            {it.description && (
              <div className="col-span-2 text-gray-600 line-clamp-2">
                {it.description}
              </div>
            )}
          </div>

          {/* Image editor */}
          {!edit?.editing ? (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-gray-600 truncate">
                <span className="text-gray-500">Image:</span>{" "}
                <a
                  href={it.image || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`${
                    it.image ? "text-blue-600 underline" : "text-gray-400"
                  }`}
                >
                  {it.image || "not set"}
                </a>
              </div>
              <button
                onClick={() => startEdit(it)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm"
                title="Edit image URL"
              >
                <Pencil className="w-4 h-4" />
                Edit image
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <label className="text-xs text-gray-500">Image URL</label>
              <input
                type="text"
                value={edit.value}
                onChange={(e) =>
                  setEditImage((prev) => ({
                    ...prev,
                    [it.itemId]: {
                      ...prev[it.itemId],
                      value: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://…"
                disabled={edit.saving}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveImage(it)}
                  disabled={edit.saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => cancelEdit(it.itemId)}
                  disabled={edit.saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600">
            View & edit <span className="font-medium">image</span> and{" "}
            <span className="font-medium">inStock</span>. Use the Sync button to
            fetch the latest catalog snapshot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black disabled:opacity-60"
          >
            <RefreshCcw className="w-4 h-4" />
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <button
            onClick={loadLatest}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-60"
          >
            <RefreshCcw className="w-4 h-4" />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, id, description, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyOutOfStock}
              onChange={(e) => setOnlyOutOfStock(e.target.checked)}
            />
            Show only out-of-stock
          </label>
          <div className="text-sm text-gray-500 ml-auto">
            Total: {menu?.items?.length ?? 0} &nbsp;|&nbsp; Showing:{" "}
            {filteredItems.length}
          </div>
        </div>
      </div>

      {/* Grouped List */}
      {loading && <div className="text-gray-600">Loading items…</div>}

      {!loading && groups.length === 0 && (
        <div className="text-gray-600">No items to display.</div>
      )}

      {!loading &&
        groups.map((cat) => {
          const catOpen = openCategories[cat.id] ?? true;

          return (
            <div key={cat.id} className="mb-6">
              {/* Category Header */}
              <button
                onClick={() => toggleCategoryOpen(cat.id)}
                className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  {catOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="text-lg font-semibold text-gray-900">
                    {cat.name}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {cat.subcategories.reduce(
                    (sum, s) => sum + s.items.length,
                    0
                  ) + cat.uncategorizedItems.length}{" "}
                  items
                </span>
              </button>

              {catOpen && (
                <div className="mt-4 space-y-6">
                  {/* Uncategorized items under this category */}
                  {cat.uncategorizedItems.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-3">
                        (No Subcategory)
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cat.uncategorizedItems.map((it) => (
                          <ItemCard key={it.itemId} it={it} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subcategories */}
                  {cat.subcategories.map((sub) => {
                    const open = openSubcats[sub.id] ?? true;
                    return (
                      <div key={sub.id}>
                        <button
                          onClick={() => toggleSubcatOpen(sub.id)}
                          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-left"
                        >
                          <div className="flex items-center gap-2">
                            {open ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                            <span className="text-sm font-semibold text-gray-900">
                              {sub.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {sub.items.length} item
                            {sub.items.length !== 1 ? "s" : ""}
                          </span>
                        </button>

                        {open && (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sub.items.map((it) => (
                              <ItemCard key={it.itemId} it={it} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
