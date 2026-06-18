import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, Edit2, Trash2, Settings, Plane,
  Package, Check, X, AlertCircle
} from "lucide-react";
import { v } from "../../components/pageUtils";


/* ── Types ────────────────────────────────────────────────────── */
interface MachineData {
  id: number;
  name: string;
  slug: string;
  type: "machine" | "drone";
  status: "active" | "maintenance" | "inactive";

  // MACHINE
  dimension?: string;
  weight?: string;
  power?: string;
  powerUsage?: string;
  maxSpeed?: string;
  workWidth?: string;
  resolution?: string;
  materialSupport?: string;
  autoFeed?: boolean;
  contourCut?: boolean;
  digitalPanel?: boolean;
  safetySensor?: boolean;

  // DRONE
  foldedDimension?: string;
  flightTime?: string;
  cameraSensor?: string;
  videoResolution?: string;
  gimbalRange?: string;
  zoom?: string;
  rtkModule?: boolean;
  thermalCamera?: string;
  obstacleSensing?: string;
  ipRating?: string;

  createdAt?: string;
  updatedAt?: string;
}

/* ── Add/Edit Modal ───────────────────────────────────────────── */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MachineData>) => void;
  editData?: MachineData | null;
}

function AddEditModal({ isOpen, onClose, onSave, editData }: ModalProps) {
  const getInitialFormData = (): Partial<MachineData> => ({
    name: "",
    slug: "",
    type: "machine",
    status: "active",

    // MACHINE
    dimension: "",
    weight: "",
    power: "",
    powerUsage: "",
    maxSpeed: "",
    workWidth: "",
    resolution: "",
    materialSupport: "",
    autoFeed: false,
    contourCut: false,
    digitalPanel: false,
    safetySensor: false,

    // DRONE
    foldedDimension: "",
    flightTime: "",
    cameraSensor: "",
    videoResolution: "",
    gimbalRange: "",
    zoom: "",
    rtkModule: false,
    thermalCamera: "",
    obstacleSensing: "",
    ipRating: "",
  });

  const [formData, setFormData] =
    useState<Partial<MachineData>>(getInitialFormData());

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData(getInitialFormData());
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const slug =
      formData.name
        ?.toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /^-|-$/g,
          ""
        );

    onSave({
      ...formData,
      slug,
      id: editData?.id,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{
          background: v("--c-card"),
          border: `1px solid ${v("--c-border")}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxHeight: "90vh",
        }}
      >
        <div className="p-8 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="font-['Poppins',sans-serif] font-bold text-2xl"
              style={{ color: v("--c-text") }}
            >
              {editData ? "Edit" : "Tambah"} {formData.type === "machine" ? "Mesin" : "Drone"}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: v("--c-bg-sec"),
                color: v("--c-text-sec"),
              }}
            >
              <X size={20} />
            </button>
          
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
            >
              Tipe
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "machine", label: "Mesin", icon: Settings },
                { value: "drone", label: "Drone", icon: Plane },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value as "machine" | "drone" })}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: formData.type === type.value ? v("--c-gradient-r") : v("--c-bg-sec"),
                    color: formData.type === type.value ? "#fff" : v("--c-text"),
                    border: `1px solid ${formData.type === type.value ? "transparent" : v("--c-border")}`,
                  }}
                >
                  <type.icon size={16} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
            >
              Nama {formData.type === "machine" ? "Mesin" : "Drone"}
            </label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Canon Imagepress V1000"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={{
                background: v("--c-bg-sec"),
                border: `1px solid ${v("--c-border")}`,
                color: v("--c-text"),
                fontFamily: "'Inter',sans-serif",
              }}
            />
          </div>

          {/* Status */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
            >
              Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "active", label: "Aktif", color: "#66BB6A" },
                { value: "maintenance", label: "Maintenance", color: "#FFB300" },
                { value: "inactive", label: "Nonaktif", color: "#EF5350" },
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: status.value as any })}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                  style={{
                    background: formData.status === status.value ? status.color : v("--c-bg-sec"),
                    color: formData.status === status.value ? "#fff" : v("--c-text"),
                    border: `1px solid ${formData.status === status.value ? "transparent" : v("--c-border")}`,
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Specification */}
          {formData.type === "machine" ? (
            <>
              {/* TECHNICAL SPEC */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: v("--c-text"),
                    fontFamily:
                      "'Poppins',sans-serif",
                  }}
                >
                  Spesifikasi Teknis
                </h3>

                <input
                  type="text"
                  placeholder="Dimensi (120x80x95 cm)"
                  value={formData.dimension || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimension: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: v("--c-bg-sec"),
                    border: `1px solid ${v("--c-border")}`,
                    color: v("--c-text"),
                  }}
                />

                <input
                  type="number"
                  placeholder="Berat (kg)"
                  value={formData.weight ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: v("--c-bg-sec"),
                    border: `1px solid ${v("--c-border")}`,
                    color: v("--c-text"),
                  }}
                />

                <select
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background:
                      v("--c-bg-sec"),
                    border: `1px solid ${v("--c-border")}`,
                    color:
                      v("--c-text"),
                  }}
                  value={formData.power || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      power: e.target.value,
                    })
                  }
                >
                  <option>
                    Pilih Tegangan
                  </option>

                  <option>
                    110V
                  </option>

                  <option>
                    220V
                  </option>

                  <option>
                    380V
                  </option>
                </select>

                <input
                  type="number"
                  placeholder="Konsumsi Daya (W)"
                  value={formData.powerUsage ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      powerUsage: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: v("--c-bg-sec"),
                    border: `1px solid ${v("--c-border")}`,
                    color: v("--c-text"),
                  }}
                />
              </div>

              {/* PERFORMANCE */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: v("--c-text"),
                  }}
                >
                  Kapasitas & Performa
                </h3>

                <input
                  type="number"
                  placeholder="Kecepatan Maksimal"
                  value={formData.maxSpeed ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxSpeed: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Lebar Kerja (mm)"
                  value={formData.workWidth ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workWidth: e.target.value,
                    })
                  }
                />

                <select
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  value={formData.resolution ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      resolution: e.target.value,
                    })
                  }
                >
                  <option value="">
                    Resolusi
                  </option>

                  <option value="720 dpi">
                    720 dpi
                  </option>

                  <option value="1080 dpi">
                    1080 dpi
                  </option>

                  <option value="1440 dpi">
                    1440 dpi
                  </option>

                  <option value="2880 dpi">
                    2880 dpi
                  </option>
                </select>
              </div>

              {/* FEATURES */}
              <div className="space-y-3">
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: v("--c-text"),
                  }}
                >
                  Fitur Unggulan
                </h3>

                {[
                  {
                    label: "Auto Feed System",
                    key: "autoFeed",
                  },
                  {
                    label: "Camera Contour Cutting",
                    key: "contourCut",
                  },
                  {
                    label: "Digital Control Panel",
                    key: "digitalPanel",
                  },
                  {
                    label: "Safety Sensor",
                    key: "safetySensor",
                  },
                ].map((feature) => (
                  <label
                    key={feature.key}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(
                        formData[
                          feature.key as keyof MachineData
                        ]
                      )}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [feature.key]:
                            e.target.checked,
                        })
                      }
                    />

                    <span
                      className="text-sm"
                      style={{
                        color: v("--c-text"),
                      }}
                    >
                      {feature.label}
                    </span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* DRONE TECH */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: v("--c-text"),
                  }}
                >
                  Spesifikasi Teknis
                </h3>

                <input
                  type="text"
                  placeholder="Dimensi Folded"
                  value={formData.foldedDimension ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      foldedDimension:
                        e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: v("--c-bg-sec"),
                    border: `1px solid ${v("--c-border")}`,
                  }}
                />

                <input
                  type="number"
                  placeholder="Berat (gram)"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background:
                      v("--c-bg-sec"),
                    border: `1px solid ${v("--c-border")}`,
                  }}
                />

                <input
                  type="number"
                  placeholder="Max Flight Time (menit)"
                  value={formData.flightTime ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      flightTime:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* CAMERA */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: v("--c-text"),
                  }}
                >
                  Camera & Gimbal
                </h3>

                <select
                  value={formData.cameraSensor ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cameraSensor:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Sensor
                  </option>

                  <option value="1/2 CMOS">
                    1/2 CMOS
                  </option>

                  <option value="1-inch CMOS">
                    1-inch CMOS
                  </option>

                  <option value="4/3 CMOS">
                    4/3 CMOS
                  </option>
                </select>

                <select
                  value={formData.videoResolution ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      videoResolution:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Video Resolution
                  </option>

                  <option value="4K">
                    4K
                  </option>

                  <option value="5.1K">
                    5.1K
                  </option>

                  <option value="8K">
                    8K
                  </option>
                </select>
              </div>

              {/* FEATURES */}
              <div className="space-y-3">
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: v("--c-text"),
                  }}
                >
                  Fitur Unggulan
                </h3>

                {[
                  {
                    label: "RTK Module",
                    key: "rtkModule",
                  },
                  {
                    label: "Thermal Camera",
                    key: "thermalCamera",
                  },
                  {
                    label: "Obstacle Sensing",
                    key: "obstacleSensing",
                  },
                ].map((feature) => (
                  <label
                    key={feature.key}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(
                        formData[
                          feature.key as keyof MachineData
                        ]
                      )}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [feature.key]:
                            e.target.checked,
                        })
                      }
                    />

                    <span
                      className="text-sm"
                      style={{
                        color: v("--c-text"),
                      }}
                    >
                      {feature.label}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
              style={{
                background: v("--c-bg-sec"),
                color: v("--c-text"),
                border: `1px solid ${v("--c-border")}`,
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300"
              style={{ background: v("--c-gradient-r") }}
            >
              {editData ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
      </motion.div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */
export function AdminInventaris() {
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "machine" | "drone">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "maintenance" | "inactive">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<MachineData | null>(null);

  // Filter
  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.name
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        ) ||
      String(m.id)
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        );
    const matchesType = filterType === "all" || m.type === filterType;
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAdd = () => {
    setEditingMachine(null);
    setIsModalOpen(true);
  };

  const handleEdit = (machine: MachineData) => {
    setEditingMachine(machine);
    setIsModalOpen(true);
  };

  const handleDelete =
    async (
      id: number
    ) => {
      const confirmDelete =
        confirm(
          "Yakin ingin menghapus item ini?"
        );

      if (
        !confirmDelete
      )
        return;

      try {
        await fetch(
          `http://localhost:3001/api/devices/${id}`,
          {
            method:
              "DELETE",
          }
        );

        await fetchDevices();
        await fetchStats();
      } catch (
        error
      ) {
        console.error(
          "Gagal menghapus:",
          error
        );
      }
    };

  const handleSave = async (
    data: Partial<MachineData>
  ) => {
    try {
      if (editingMachine) {
        await fetch(
          `http://localhost:3001/api/devices/${editingMachine.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              data
            ),
          }
        );
      } else {
        await fetch(
          "http://localhost:3001/api/devices",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              data
            ),
          }
        );
      }

      // refresh data
      await fetchDevices();
      await fetchStats();

      setIsModalOpen(false);
      setEditingMachine(null);
    } catch (error) {
      console.error(
        "Gagal menyimpan:",
        error
      );
    }
  };
  
  const [
    stats,
    setStats,
  ] = useState({
    total: 0,
    machines: 0,
    drones: 0,
    active: 0,
    maintenance: 0,
  });

  const fetchStats =
    async () => {
      try {
        const res =
          await fetch(
            "http://localhost:3001/api/devices/stats"
          );

        const data =
          await res.json();

        setStats(data);
      } catch (error) {
        console.error(
          "Gagal mengambil stats:",
          error
        );
      }
    };

  const fetchDevices =
    async () => {
      try {
        const res =
          await fetch(
            "http://localhost:3001/api/devices"
          );

        const data =
          await res.json();

        setMachines(data);
      } catch (error) {
        console.error(
          "Gagal mengambil devices:",
          error
        );
      }
    };

  useEffect(() => {
    fetchDevices();
    fetchStats();
  }, []);
  
  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-['Poppins',sans-serif] font-bold text-3xl md:text-4xl mb-2"
          style={{ color: v("--c-text") }}
        >
          Manajemen{" "}
          <span
            style={{
              background: v("--c-gradient-r"),
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Perangkat
          </span>
        </h1>
        <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
          Kelola mesin produksi dan drone yang tersedia di Malikussaleh Advertising
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Item", value: stats.total, color: v("--c-primary"), icon: Package },
          { label: "Mesin", value: stats.machines, color: "#42A5F5", icon: Settings },
          { label: "Drone", value: stats.drones, color: "#FFB300", icon: Plane },
          { label: "Aktif", value: stats.active, color: "#66BB6A", icon: Check },
          { label: "Maintenance", value: stats.maintenance, color: "#FFA726", icon: AlertCircle },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-5"
            style={{
              background: v("--c-card"),
              border: `1px solid ${v("--c-border")}`,
              boxShadow: v("--c-shadow-card"),
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}20` }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <p
                className="font-['Poppins',sans-serif] font-bold text-2xl"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
            </div>
            <p
              className="text-xs"
              style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: v("--c-text-sec") }}
          />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: v("--c-card"),
              border: `1px solid ${v("--c-border")}`,
              color: v("--c-text"),
              fontFamily: "'Inter',sans-serif",
            }}
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          {[
            { value: "all", label: "Semua" },
            { value: "machine", label: "Mesin" },
            { value: "drone", label: "Drone" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value as any)}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: filterType === filter.value ? v("--c-gradient-r") : v("--c-card"),
                color: filterType === filter.value ? "#fff" : v("--c-text"),
                border: `1px solid ${filterType === filter.value ? "transparent" : v("--c-border")}`,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-105"
          style={{ background: v("--c-gradient-r"), fontFamily: "'Inter',sans-serif" }}
        >
          <Plus size={18} />
          Tambah Item
        </button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: v("--c-card"),
          border: `1px solid ${v("--c-border")}`,
          boxShadow: v("--c-shadow-card"),
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: v("--c-bg-sec") }}>
                {["ID", "Nama", "Tipe", "Status", "Tanggal Ditambahkan", "Aksi"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-semibold"
                    style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMachines.length > 0 ? (
                filteredMachines.map((machine, i) => (
                  <motion.tr
                    key={machine.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      borderTop: `1px solid ${v("--c-border")}`,
                    }}
                  >
                    <td className="px-6 py-4">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: v("--c-bg-sec"),
                          color: v("--c-text"),
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {machine.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: v("--c-text"), fontFamily: "'Inter',sans-serif" }}
                      >
                        {machine.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: machine.type === "machine" ? "rgba(66,165,245,0.1)" : "rgba(255,179,0,0.1)",
                          color: machine.type === "machine" ? "#42A5F5" : "#FFB300",
                        }}
                      >
                        {machine.type === "machine" ? <Settings size={12} /> : <Plane size={12} />}
                        {machine.type === "machine" ? "Mesin" : "Drone"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background:
                            machine.status === "active"
                              ? "rgba(102,187,106,0.1)"
                              : machine.status === "maintenance"
                              ? "rgba(255,167,38,0.1)"
                              : "rgba(239,83,80,0.1)",
                          color:
                            machine.status === "active"
                              ? "#66BB6A"
                              : machine.status === "maintenance"
                              ? "#FFA726"
                              : "#EF5350",
                        }}
                      >
                        {machine.status === "active" && <Check size={12} />}
                        {machine.status === "maintenance" && <AlertCircle size={12} />}
                        {machine.status === "active" ? "Aktif" : machine.status === "maintenance" ? "Maintenance" : "Nonaktif"}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}
                    >
                      {machine.createdAt
                        ? new Date(
                            machine.createdAt
                          ).toLocaleDateString(
                            "id-ID"
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(machine)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{
                            background: "rgba(66,165,245,0.1)",
                            color: "#42A5F5",
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(machine.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{
                            background: "rgba(239,83,80,0.1)",
                            color: "#EF5350",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Package size={48} style={{ color: v("--c-text-sec"), margin: "0 auto 16px" }} />
                    <p
                      className="font-semibold mb-1"
                      style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}
                    >
                      Tidak ada item ditemukan
                    </p>
                    <p className="text-sm" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                      Coba ubah filter atau kata kunci pencarian
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editData={editingMachine}
      />
    </div>
  );
}
