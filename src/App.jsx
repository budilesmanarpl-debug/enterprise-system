import React, { useState, useEffect, useRef } from 'react';
import { 
  Newspaper, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  XCircle,
  PauseCircle,
  PlusCircle,
  Trash2,
  ChevronRight,
  GitMerge,
  Users,
  ArrowRight,
  Save,
  Building,
  UserCircle,
  Tags,
  Mail,
  ShieldAlert,
  Lock,
  FileUp,
  Download,
  Edit2,
  Bell,
  Image as ImageIcon,
  FolderOpen,
  Search,
  RefreshCw,
  History
} from 'lucide-react';

// --- KONFIGURASI SESI ---
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 Menit (dalam milidetik)

// --- UTILITIES ---
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    return;
  }
  // Menghilangkan objek bersarang dan data gambar base64 berukuran besar agar hasil export bersih
  const cleanData = data.map(item => {
    const cleanItem = {};
    for (const key in item) {
      if (key === 'image') continue; // Omit giant base64 image string
      if (typeof item[key] !== 'object') {
        cleanItem[key] = item[key];
      } else if (key === 'attachment' && item[key]) {
        cleanItem[key] = item[key].name;
      } else if (key === 'path' && Array.isArray(item[key])) {
        cleanItem[key] = item[key].map(step => `${step.role}: ${step.pic}`).join(' -> ');
      }
    }
    return cleanItem;
  });

  const headers = Object.keys(cleanData[0]).join(',');
  const rows = cleanData.map(obj => 
    Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().getTime()}.csv`;
  a.click();
};

// --- DATA SIMULASI UTAMA (Sesuai Database MySQL) ---
const INITIAL_NEWS = [
  {
    id: 1,
    title: "Wuling Eksion, SUV 7-Seater Pertama dengan EV dan PHEV Di Indonesia Hadir di Makassar",
    category: "Press Release",
    content: "SUV terbaru Wuling yang mengusung semangat 'Exploring Family Journeys' tersedia dalam dua varian Makassar, 19 Mei 2026 - Wuling Motors memperkenalkan teknologi elektrifikasi terbarunya untuk merambah pasar Indonesia Timur melalui ajang pameran regional spektakuler.",
    date: "2026-05-19",
    author: "Wuling Press",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "Wuling Memperkenalkan Eksion 'Exploring Family Journeys' di Summarecon Mall Bekasi",
    category: "Press Release",
    content: "SUV 7-Seater terbaru dari Wuling yang dilengkapi dengan pilihan teknologi EV dan Plug-in Hybrid Bekasi, 13 Mei 2026 - Wuling Motors menghadirkan pameran spesial guna menyapa masyarakat perkotaan dengan teknologi ramah lingkungan modern.",
    date: "2026-05-13",
    author: "Wuling Press",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Wuling Eksion Handover Ceremony 'Exploring Family Journeys' Digelar di Summarecon Mall...",
    category: "Press Release",
    content: "SUV 7-seater Wuling terbaru dengan teknologi EV dan Plug-in Hybrid ini telah membukukan seribu pemesanan Tangerang, 9 Mei 2026 - Wuling secara resmi melakukan serah terima unit perdana secara seremonial meriah kepada para pelanggan setia.",
    date: "2026-05-09",
    author: "Wuling Press",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800"
  }
];

// Data awal berkas Formulir & Prosedur Publik (Dilengkapi Category)
const INITIAL_PROCEDURES = [
  { id: 1, title: "Formulir Pendaftaran Vendor & Mitra Kerja", department: "Finance & Accounting", category: "Form", type: "PDF", size: "1.4 MB", description: "Dokumen pendaftaran resmi bagi calon pihak ketiga, kontraktor, dan vendor baru perusahaan." },
  { id: 2, title: "Panduan Pengajuan Kerjasama Penyelidikan Teknologi", department: "Information Technology", category: "Prosedur", type: "PDF", size: "2.1 MB", description: "Dokumen prosedur tata cara pengajuan riset integrasi sistem luar kepada departemen IT." },
  { id: 3, title: "Template Profil Pelamar Kerja Magang (Internship)", department: "Human Resources", category: "Form", type: "DOCX", size: "480 KB", description: "Format CV standardisasi dan kuesioner awal pemohon program magang perguruan tinggi." },
  { id: 4, title: "Prosedur Klaim Garansi Suku Cadang Resmi", department: "Finance & Accounting", category: "Prosedur", type: "ZIP", size: "5.8 MB", description: "Paket panduan administrasi disertai formulir pelaporan klaim kerusakan teknis." }
];

const INITIAL_APPROVALS = [
  { id: 101, type: "Cuti Tahunan", requester: "Budi Santoso", description: "Cuti liburan keluarga (3 hari)", status: "Pending", date: "2026-05-22", currentStepIndex: 0, path: [{ level: 1, role: "Supervisor", pic: "Siti Aminah", email: "siti.aminah@corp.com" }, { level: 2, role: "Manager", pic: "Andi Wijaya", email: "andi.wijaya@corp.com" }], attachment: { name: "dokumen_cuti_keluarga.pdf", size: "1.2 MB" } },
  { id: 102, type: "Pengadaan Barang", requester: "Siti Aminah", description: "Pembelian 2 Unit Laptop untuk tim desain", status: "Pending", date: "2026-05-23", currentStepIndex: 1, path: [{ level: 1, role: "Supervisor", pic: "Siti Aminah", email: "siti.aminah@corp.com" }, { level: 2, role: "Manager", pic: "Budi Santoso", email: "budi.santoso@corp.com" }], attachment: null },
  { id: 103, type: "Klaim Biaya", requester: "Andi Wijaya", description: "Biaya transport kunjungan klien", status: "Approved", date: "2026-05-20", currentStepIndex: 0, path: [{ level: 1, role: "Director", pic: "Andi Wijaya", email: "andi.wijaya@corp.com" }], attachment: { name: "kuitansi_perjalanan.zip", size: "4.5 MB" } },
];

const INITIAL_ROUTING = [
  {
    id: 1,
    approvalType: "Cuti Tahunan",
    department: "Internal Departemen",
    path: [
      { level: 1, role: "Supervisor", pic: "Siti Aminah", email: "siti.aminah@corp.com" },
      { level: 2, role: "Manager", pic: "Budi Santoso", email: "budi.santoso@corp.com" }
    ]
  },
  {
    id: 2,
    approvalType: "Pengadaan Barang",
    department: "Lintas Departemen",
    path: [
      { level: 1, role: "Supervisor", pic: "Siti Aminah", email: "siti.aminah@corp.com" },
      { level: 2, role: "Manager", pic: "Budi Santoso", email: "budi.santoso@corp.com" },
      { level: 3, role: "Director", pic: "Andi Wijaya", email: "andi.wijaya@corp.com" }
    ]
  }
];

const INITIAL_DEPARTMENTS = [
  { id: 1, code: "IT", name: "Information Technology" },
  { id: 2, code: "HR", name: "Human Resources" },
  { id: 3, code: "FIN", name: "Finance & Accounting" },
];

const INITIAL_APPROVAL_TYPES = [
  { id: 1, code: "LV", name: "Cuti Tahunan" },
  { id: 2, code: "PR", name: "Pengadaan Barang" },
  { id: 3, code: "EX", name: "Klaim Biaya" },
];

const INITIAL_EMPLOYEES = [
  { id: 1, nik: "EMP001", name: "Budi Santoso", email: "budi.santoso@corp.com", department: "IT", role: "Manager", username: "budi", password: "password123" },
  { id: 2, nik: "EMP002", name: "Siti Aminah", email: "siti.aminah@corp.com", department: "IT", role: "Supervisor", username: "siti", password: "password123" },
  { id: 3, nik: "EMP003", name: "Andi Wijaya", email: "andi.wijaya@corp.com", department: "FIN", role: "Director", username: "andi", password: "password123" },
];

const INITIAL_ROLE_ACCESS = {
  'administrator': [
    'dashboard_home', 'dashboard_news', 'dashboard_docs', 'dashboard_approval', 
    'master_department', 'master_approval_type', 'master_employee', 
    'dashboard_routing', 'master_role_access'
  ],
  'Director': ['dashboard_home', 'dashboard_approval', 'dashboard_routing', 'dashboard_docs'],
  'Manager': ['dashboard_home', 'dashboard_approval', 'dashboard_docs'],
  'Supervisor': ['dashboard_home', 'dashboard_approval'],
  'Staff': ['dashboard_home', 'dashboard_approval'],
};

const ALL_MENUS = [
  { id: 'dashboard_home', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'dashboard_news', label: 'Manajemen Berita', icon: <Newspaper className="w-5 h-5" /> },
  { id: 'dashboard_docs', label: 'Form & Prosedur', icon: <FolderOpen className="w-5 h-5" /> },
  { id: 'dashboard_approval', label: 'Sistem Approval', icon: <FileText className="w-5 h-5" /> },
  { id: 'master_department', label: 'Master Departemen', icon: <Building className="w-5 h-5" /> },
  { id: 'master_approval_type', label: 'Master Tipe Approval', icon: <Tags className="w-5 h-5" /> },
  { id: 'master_employee', label: 'Master Karyawan', icon: <UserCircle className="w-5 h-5" /> },
  { id: 'dashboard_routing', label: 'Master Routing PIC', icon: <GitMerge className="w-5 h-5" /> },
  { id: 'master_role_access', label: 'Role Access (Hak Akses)', icon: <Lock className="w-5 h-5" /> },
  { id: 'dashboard_logs', label: 'Log Perubahan', icon: <History className="w-5 h-5" /> },
];

const PublicNavbar = ({ onNavigate, onLoginClick }) => (
  <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate('portal')}>
          <ShieldCheck className="h-8 w-8 text-blue-400 mr-2" />
          <span className="font-bold text-xl tracking-wider">CORP<span className="text-blue-400">PORTAL</span></span>
        </div>
        <div>
          <button 
            onClick={onLoginClick}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Login Dashboard
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const PortalPage = ({ news, procedures, departments, onNavigate, onLoginClick }) => {
  const [selectedNews, setSelectedNews] = useState(null);
  const [activeTab, setActiveTab] = useState('berita'); // 'berita' atau 'prosedur'
  const [selectedDept, setSelectedDept] = useState('Semua Departemen');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadAlert, setDownloadAlert] = useState(null);

  // --- LOGIKA PAGINATION ---
  const [pageNews, setPageNews] = useState(1);
  const [pageProcs, setPageProcs] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Reset halaman saat filter berubah agar tidak terjebak di halaman kosong
  useEffect(() => {
    setPageProcs(1);
  }, [selectedDept, searchQuery]);

  // Data yang sudah dipaginasi (Slice)
  const paginatedNews = news.slice((pageNews - 1) * ITEMS_PER_PAGE, pageNews * ITEMS_PER_PAGE);
  const totalPagesNews = Math.ceil(news.length / ITEMS_PER_PAGE);

  const filteredProcedures = procedures.filter(proc => {
    const matchesDept = selectedDept === 'Semua Departemen' || proc.department === selectedDept;
    const matchesSearch = proc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const paginatedProcs = filteredProcedures.slice((pageProcs - 1) * ITEMS_PER_PAGE, pageProcs * ITEMS_PER_PAGE);
  const totalPagesProcs = Math.ceil(filteredProcedures.length / ITEMS_PER_PAGE);

  // Komponen Helper Pagination UI
  const Pagination = ({ current, total, onChange }) => {
    if (total <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-10 animate-fadeIn">
        <button 
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        {[...Array(total)].map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={`w-10 h-10 rounded-lg border font-bold text-sm transition-all ${current === i + 1 ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {i + 1}
          </button>
        ))}
        <button 
          disabled={current === total}
          onClick={() => onChange(current + 1)}
          className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // Simulasi Pengunduhan Dokumen Publik
  const handleDownloadProc = (proc) => {
    const element = document.createElement("a");
    const file = new Blob([`Berkas Unduhan Resmi: ${proc.title}\nKategori: ${proc.category || 'Prosedur'}\nDepartemen: ${proc.department}\nUkuran: ${proc.size}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${proc.title.replace(/\s+/g, '_').toLowerCase()}.${proc.type.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setDownloadAlert(`Berhasil mengunduh berkas: ${proc.title}`);
    setTimeout(() => setDownloadAlert(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative">
      {/* Navbar Publik */}
      <PublicNavbar onNavigate={onNavigate} onLoginClick={onLoginClick} />

      {/* Toast Alert Unduhan */}
      {downloadAlert && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 border border-slate-700 animate-slideUp">
          <Download className="w-5 h-5 text-emerald-400 animate-bounce" />
          <span className="text-xs font-semibold">{downloadAlert}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Portal Komunikasi & Informasi</h1>
        <p className="text-base md:text-lg text-blue-200 max-w-2xl mx-auto">
          Akses berita terbaru korporat, kelola operasional, serta unduh formulir resmi organisasi.
        </p>
      </div>

      {/* Sub-Header Tab Navigasi Publik */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center gap-6">
          <button 
            onClick={() => setActiveTab('berita')}
            className={`py-4 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'berita' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Berita & Artikel Terbaru
          </button>
          <button 
            onClick={() => setActiveTab('prosedur')}
            className={`py-4 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'prosedur' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Form & Prosedur Publik
          </button>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {activeTab === 'berita' ? (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-[#2a3754] tracking-tight">Berita & Artikel Terbaru</h2>
              <div className="h-1 w-20 bg-blue-600 mx-auto mt-3 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
              {paginatedNews.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-500 italic">Belum ada berita yang dipublikasikan.</p>
                </div>
              ) : (
                paginatedNews.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-slate-300"
                  >
                    <div>
                      <div className="relative">
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"} 
                          alt={item.title} 
                          className="w-full h-52 object-cover"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800";
                          }}
                        />
                      </div>
                      <div className="p-6 pb-0">
                        <span className="inline-block px-3 py-1 text-[11px] font-medium text-slate-500 bg-white border border-slate-300 rounded mb-4">
                          {item.category || "Press Release"}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug line-clamp-2 h-12" title={item.title}>
                          {item.title}
                        </h3>
                        <p className="text-slate-600 text-xs mb-6 line-clamp-3 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-6 pt-0 mt-auto">
                      <button 
                        onClick={() => setSelectedNews(item)}
                        className="bg-[#2f3e61] hover:bg-[#202c48] text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors"
                      >
                        Baca Selengkapnya
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Kontrol Pagination Berita */}
            <Pagination current={pageNews} total={totalPagesNews} onChange={setPageNews} />
          </div>
        ) : (
          /* Tampilan Form & Prosedur Publik */
          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-[#2a3754] tracking-tight">Unduh Formulir & Prosedur</h2>
              <p className="text-slate-500 text-sm mt-2">Daftar berkas regulasi resmi yang dapat diakses langsung oleh masyarakat umum & mitra bisnis.</p>
              <div className="h-1 w-20 bg-blue-600 mx-auto mt-3 rounded-full"></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filter Departemen Kiri */}
              <div className="w-full lg:w-1/4 shrink-0">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-52">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">Kategori Divisi</h3>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setSelectedDept('Semua Departemen')}
                      className={`text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${selectedDept === 'Semua Departemen' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      <span>Semua Departemen</span>
                      <span className="bg-slate-200/50 text-[10px] text-slate-700 px-1.5 py-0.5 rounded-full font-mono">{procedures.length}</span>
                    </button>
                    {departments.map(dept => {
                      const count = procedures.filter(p => p.department === dept.name).length;
                      return (
                        <button
                          key={dept.id}
                          onClick={() => setSelectedDept(dept.name)}
                          className={`text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${selectedDept === dept.name ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                          <span className="truncate pr-2">{dept.name}</span>
                          <span className="bg-slate-200/50 text-[10px] text-slate-700 px-1.5 py-0.5 rounded-full font-mono shrink-0">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Grid Berkas Kanan */}
              <div className="flex-1">
                {/* Cari Berkas */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Cari judul formulir, izin usaha, atau tata cara prosedur..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 text-sm shadow-sm"
                  />
                </div>

                {/* List Berkas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  {paginatedProcs.map(proc => (
                    <div key={proc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold text-blue-800 bg-blue-50 rounded border border-blue-100 uppercase tracking-wide">
                              {proc.department}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wide ${proc.category === 'Form' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                              {proc.category || 'Prosedur'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {proc.type} &bull; {proc.size}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug mb-2">{proc.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed mb-4">{proc.description}</p>
                      </div>
                      <button 
                        onClick={() => handleDownloadProc(proc)}
                        className="w-full bg-[#2f3e61] hover:bg-[#202c48] text-white py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Unduh Dokumen Resmi
                      </button>
                    </div>
                  ))}
                  {paginatedProcs.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-white rounded-xl border border-slate-200">
                      <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-600">Berkas tidak ditemukan</p>
                      <p className="text-xs text-slate-400 mt-1">Silakan cari kata kunci lain atau pilih kategori divisi berbeda.</p>
                    </div>
                  )}
                </div>

                {/* Kontrol Pagination Prosedur */}
                <Pagination current={pageProcs} total={totalPagesProcs} onChange={setPageProcs} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Berita */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-2">
                  {selectedNews.category || "Berita"}
                </span>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-900">{selectedNews.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedNews.date} &bull; Oleh {selectedNews.author}</p>
              </div>
              <button 
                onClick={() => setSelectedNews(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <img 
                src={selectedNews.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"} 
                alt={selectedNews.title}
                className="w-full h-64 object-cover rounded-lg mb-6 shadow-sm"
              />
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {selectedNews.content}
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedNews(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Tutup Berita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm mt-auto">
        <p>&copy; 2026 Portal Corporate. All rights reserved.</p>
        <p className="mt-1">Secure Internal Network</p>
      </footer>
    </div>
  );
};

// --- KOMPONEN CANVAS TEXT CAPTCHA UNTUK KEAMANAN LOGIN ---
const TextCaptcha = ({ onCaptchaValidate, reloadTrigger }) => {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Generate string acak alfanumerik sepanjang 6 karakter
  const generateRandomText = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; // Menghindari karakter ambigu seperti O, 0, I, l
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  };

  const handleRefresh = () => {
    const newText = generateRandomText();
    setCaptchaText(newText);
    setUserInput('');
    setIsValid(false);
    onCaptchaValidate(false, newText); // Beritahu parent bahwa status kembali invalid
  };

  // Efek untuk generate kode awal & ketika reloadTrigger berubah
  useEffect(() => {
    handleRefresh();
  }, [reloadTrigger]);

  // Efek untuk menggambar teks CAPTCHA ke Canvas HTML5 dengan distorsi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Bersihkan canvas dan beri latar belakang abu-abu terang
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tambahkan garis pengganggu (noise lines)
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.4)`;
      ctx.lineWidth = 1.5 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Tambahkan titik-titik kecil pengganggu (noise dots)
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, 0.6)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gambar teks CAPTCHA per karakter dengan rotasi acak
    ctx.font = 'bold 26px Courier New, monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < captchaText.length; i++) {
      const char = captchaText[i];
      const x = 16 + i * 26;
      const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
      const angle = (Math.random() - 0.5) * 0.4; // Sudut rotasi antara -11 hingga +11 derajat

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Warna teks acak namun tetap gelap agar mudah dibaca manusia
      ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, [captchaText]);

  // Tangani perubahan input pengguna
  const handleInputChange = (e) => {
    const val = e.target.value;
    setUserInput(val);
    const valid = val === captchaText;
    setIsValid(valid);
    onCaptchaValidate(valid, captchaText);
  };

  return (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {/* Canvas untuk menggambar CAPTCHA */}
          <canvas 
            ref={canvasRef} 
            width={180} 
            height={46} 
            className="border border-slate-300 rounded bg-white shadow-inner select-none pointer-events-none"
          />
          <button 
            type="button"
            onClick={handleRefresh}
            title="Segarkan Kode CAPTCHA"
            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-bold tracking-tight bg-slate-200/50 px-1.5 py-0.5 rounded">
          TEXT CAPTCHA
        </span>
      </div>

      <div>
        <input 
          type="text"
          placeholder="Masukkan kode di atas..."
          value={userInput}
          onChange={handleInputChange}
          className={`w-full px-3 py-1.5 border rounded-md outline-none text-xs font-mono font-bold tracking-wider ${
            userInput 
              ? isValid 
                ? 'border-emerald-500 bg-emerald-50 focus:ring-1 focus:ring-emerald-500' 
                : 'border-rose-400 bg-rose-50 focus:ring-1 focus:ring-rose-400'
              : 'border-slate-300 focus:ring-1 focus:ring-blue-500'
          }`}
          required
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-[10px] text-slate-400">Sensitif terhadap huruf besar/kecil (Case Sensitive)</p>
          {userInput && (
            <span className={`text-[10px] font-bold ${isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isValid ? '✓ Kode Cocok' : '✗ Belum Sesuai'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN AUTENTIKASI: LOGIN PAGE ---
const LoginPage = ({ onLogin, onBack, employees }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaRefreshTrigger, setCaptchaRefreshTrigger] = useState(0);

  // Fungsi callback dari child component untuk update status validasi captcha
  const handleCaptchaStatus = (isValid) => {
    setIsCaptchaValid(isValid);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validasi CAPTCHA terlebih dahulu
    if (!isCaptchaValid) {
      setError('Kode CAPTCHA tidak cocok! Harap masukkan ulang dengan benar.');
      // Triger refresh captcha baru demi alasan keamanan pasca kegagalan
      setCaptchaRefreshTrigger(prev => prev + 1);
      return;
    }
    
    // 2. Cek kredensial super admin
    if (username === 'admin' && password === 'admin123') {
      onLogin({ username: 'admin', role: 'administrator', name: 'Super Admin', department: 'IT' });
      return;
    }

    // 3. Cek kredensial dari daftar karyawan dinamis (Master Employee)
    const matchedEmployee = employees.find(
      (emp) => emp.username === username && emp.password === password
    );

    if (matchedEmployee) {
      onLogin({ 
        username: matchedEmployee.username, 
        role: matchedEmployee.role, 
        name: matchedEmployee.name,
        department: matchedEmployee.department,
        email: matchedEmployee.email
      });
    } else {
      setError('Username atau password salah! Silakan periksa kembali akun Anda.');
      // Refresh captcha demi keamanan saat terjadi kesalahan login
      setCaptchaRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-900 py-6 text-center relative">
          <button onClick={onBack} className="absolute left-4 top-6 text-blue-200 hover:text-white">
            <X className="h-6 w-6" />
          </button>
          <ShieldCheck className="h-12 w-12 text-blue-400 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white">Login Sistem</h2>
        </div>
        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Komponen Text CAPTCHA Keamanan */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Verifikasi Keamanan</label>
              <TextCaptcha 
                onCaptchaValidate={handleCaptchaStatus} 
                reloadTrigger={captchaRefreshTrigger} 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-md transition-colors text-sm"
            >
              Masuk ke Dashboard
            </button>
          </form>
          <div className="mt-6 bg-slate-50 p-3 rounded-lg text-[11px] text-slate-600 border border-slate-100">
            <p className="font-bold mb-1">Kredensial Akun Demonstrasi:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Super Admin: <b>admin</b> / <b>admin123</b></li>
              <li>Manager: <b>budi</b> / <b>password123</b></li>
              <li>Supervisor: <b>siti</b> / <b>password123</b></li>
              <li>Director: <b>andi</b> / <b>password123</b></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APLIKASI INTERNAL DASHBOARD: MANAJEMEN BERITA ---
const NewsManagerApp = ({ news, setNews, addLog, user }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Press Release');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(''); // Stores image as Base64 string
  const [imageName, setImageName] = useState(''); // Stores selected file name
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle local image file selection and conversion to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Format file salah! Harap pilih jenis berkas gambar saja (PNG, JPG, JPEG, GIF, WEBP).');
        setTimeout(() => setErrorMsg(''), 5000);
        return;
      }
      setErrorMsg('');
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result); // Base64 encoding
        setImageName(file.name);
      };
      reader.onerror = () => {
        setErrorMsg('Gagal membaca berkas gambar. Silakan coba berkas lain.');
        setTimeout(() => setErrorMsg(''), 5000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNews = (e) => {
    e.preventDefault();
    if (editingId) {
      setNews(news.map(n => n.id === editingId ? { 
        ...n, 
        title, 
        category, 
        content, 
        image: image || n.image,
        modifyDate: new Date().toLocaleString('id-ID'),
        modifyBy: user.name
      } : n));
      addLog('UPDATE', 'Manajemen Berita', title);
      setSuccessMsg('Berita berhasil diperbarui.');
    } else {
      const newNews = {
        id: Date.now(),
        title,
        category,
        content,
        date: new Date().toISOString().split('T')[0],
        author: "Admin Corporate",
        image: image || "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800",
        modifyDate: new Date().toLocaleString('id-ID'),
        modifyBy: user.name
      };
      setNews([newNews, ...news]);
      addLog('CREATE', 'Manajemen Berita', title);
      setSuccessMsg('Berita berhasil dipublikasikan secara real-time ke portal.');
    }

    setTitle('');
    setContent('');
    setImage('');
    setImageName('');
    setEditingId(null);
    setIsFormOpen(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDelete = (item) => {
    setNews(news.filter(n => n.id !== item.id));
    addLog('DELETE', 'Manajemen Berita', item.title);
    setSuccessMsg('Berita berhasil dihapus.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setContent(item.content);
    setImage(item.image);
    setIsFormOpen(true);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Manajemen Berita & Artikel</h2>
          <p className="text-xs md:text-sm text-slate-500">Buat, sunting, dan hapus rilis berita korporasi yang muncul di beranda portal publik.</p>
        </div>
        <button 
          onClick={() => {
            setTitle('');
            setContent('');
            setImage('');
            setImageName('');
            setErrorMsg('');
            setEditingId(null);
            setIsFormOpen(!isFormOpen);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
        >
          {isFormOpen ? <X className="w-4 h-4 mr-2"/> : <PlusCircle className="w-4 h-4 mr-2"/>}
          {isFormOpen ? 'Batal' : 'Buat Berita Baru'}
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm animate-fadeIn">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm animate-fadeIn">
          {errorMsg}
        </div>
      )}

      {isFormOpen && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-slate-200 mb-6 max-w-3xl animate-fadeIn">
          <h3 className="text-lg font-bold mb-4 border-b pb-2 text-slate-800">{editingId ? 'Sunting Berita' : 'Publikasikan Berita Baru'}</h3>
          <form onSubmit={handleAddNews}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Berita</label>
                <input 
                  type="text" required
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Contoh: Wuling Meluncurkan Model SUV Hybrid Baru"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Berita</label>
                <select 
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="Press Release">Press Release</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Internal News">Internal News</option>
                </select>
              </div>
            </div>

            {/* Unggah Gambar Cover Berita */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gambar Cover Berita</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-5 cursor-pointer transition-colors bg-slate-50 relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                {image ? (
                  <div className="flex flex-col items-center gap-2 text-center relative z-20">
                    <img 
                      src={image} 
                      alt="Pratinjau Berita" 
                      className="w-40 h-24 object-cover rounded-lg shadow-sm border border-slate-200"
                    />
                    <span className="text-xs font-semibold text-blue-700 truncate max-w-xs block">
                      {imageName || 'Gambar Terpilih'}
                    </span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setImage('');
                        setImageName('');
                      }} 
                      className="text-xs text-red-500 hover:text-red-700 underline font-semibold"
                    >
                      Hapus & Ganti Gambar
                    </button>
                  </div>
                ) : (
                  <div className="text-center relative z-20">
                    <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <span className="text-sm text-slate-600 font-semibold block">Klik untuk Unggah Gambar Cover</span>
                    <span className="text-xs text-slate-400">Mendukung format gambar JPEG, PNG, WEBP</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Konten Berita</label>
              <textarea 
                required rows="5"
                value={content} onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
                placeholder="Tulis artikel lengkap di sini..."
              ></textarea>
            </div>

            <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
              {editingId ? 'Simpan Perubahan' : 'Publikasikan Sekarang'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Artikel Berita</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Modifikasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Oleh</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tanggal Rilis</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 text-sm max-w-md truncate">{item.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.content}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {item.modifyDate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-semibold">
                  {item.modifyBy || 'System'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {item.date}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded transition-colors"
                      title="Sunting Berita"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item)} 
                      className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded transition-colors"
                      title="Hapus Berita"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- APLIKASI INTERNAL DASHBOARD: MANAJEMEN FORM & PROSEDUR ---
const FormProcedureManagerApp = ({ procedures, setProcedures, departments, addLog, user }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('Prosedur'); 
  const [type, setType] = useState('PDF');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Fungsi saat mengunggah berkas asli secara interaktif
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toUpperCase();
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      const computedSize = sizeInMB === '0.0' ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeInMB} MB`;

      // Otomatis isi kolom input berdasarkan file yang dipilih
      setTitle(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      setType(extension);
      setFileSize(computedSize);
      setUploadedFile({
        name: file.name,
        size: computedSize
      });
    }
  };

  const handleAddProcedure = (e) => {
    e.preventDefault();
    if (!department) return;

    const newProc = {
      id: editingId || Date.now(),
      title,
      description,
      department,
      category, 
      type,
      size: fileSize,
      attachment: uploadedFile || (editingId ? procedures.find(p => p.id === editingId)?.attachment : null),
      modifyDate: new Date().toLocaleString('id-ID'),
      modifyBy: user.name
    };

    if (editingId) {
      setProcedures(procedures.map(p => p.id === editingId ? newProc : p));
      addLog('UPDATE', 'Form & Prosedur', title);
      setSuccessMsg('Dokumen berhasil diperbarui.');
    } else {
      setProcedures([newProc, ...procedures]);
      addLog('CREATE', 'Form & Prosedur', title);
      setSuccessMsg('Dokumen formulir/prosedur baru berhasil dipublikasikan untuk publik.');
    }
    
    // Reset fields
    setTitle('');
    setDescription('');
    setDepartment('');
    setCategory('Prosedur');
    setUploadedFile(null);
    setEditingId(null);
    setIsFormOpen(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDelete = (item) => {
    setProcedures(procedures.filter(p => p.id !== item.id));
    addLog('DELETE', 'Form & Prosedur', item.title);
    setSuccessMsg('Dokumen berhasil dihapus.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setDepartment(item.department);
    setCategory(item.category);
    setType(item.type);
    setFileSize(item.size);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Form & Prosedur</h2>
          <p className="text-sm text-slate-500">Kelola daftar file formulir, dokumen panduan, dan kebijakan yang dapat diunduh publik.</p>
        </div>
        <button 
          onClick={() => {
            setTitle('');
            setDescription('');
            setDepartment('');
            setCategory('Prosedur');
            setUploadedFile(null);
            setEditingId(null);
            setIsFormOpen(!isFormOpen);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium"
        >
          {isFormOpen ? <X className="w-4 h-4 mr-2"/> : <PlusCircle className="w-4 h-4 mr-2"/>}
          {isFormOpen ? 'Batal' : 'Tambah Berkas Baru'}
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm">
          {successMsg}
        </div>
      )}

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 max-w-3xl animate-fadeIn">
          <h3 className="text-lg font-bold mb-4 border-b pb-2 text-slate-800">{editingId ? 'Sunting Dokumen' : 'Tambahkan Formulir / Prosedur Baru'}</h3>
          <form onSubmit={handleAddProcedure}>
            {/* Step Unggah File Fisik */}
            <div className="mb-5 bg-slate-50 p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors">
              <label className="flex flex-col items-center justify-center cursor-pointer text-center">
                <FileUp className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-600">Klik untuk Unggah Berkas Dokumen</span>
                <span className="text-xs text-slate-400 mt-1">Sistem akan otomatis mendeteksi nama file, tipe ekstensi, dan ukuran file.</span>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
              {uploadedFile && (
                <div className="mt-3 bg-white p-2 border rounded-md flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span className="truncate pr-3">File Terpilih: {uploadedFile.name} ({uploadedFile.size})</span>
                  <button type="button" onClick={() => setUploadedFile(null)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Dokumen</label>
                <input 
                  type="text" required
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Contoh: Formulir Pendaftaran Mitra Kerja"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Divisi / Departemen Pemilik</label>
                <select 
                  required
                  value={department} onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">-- Pilih Departemen --</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Dokumen</label>
                <select 
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white font-semibold"
                >
                  <option value="Prosedur">Prosedur (Panduan/SOP)</option>
                  <option value="Form">Form (Lembar Isian/Template)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Ekstensi File</label>
                <select 
                  value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">Word (DOCX)</option>
                  <option value="XLSX">Excel (XLSX)</option>
                  <option value="ZIP">ZIP Archive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ukuran Berkas</label>
                <input 
                  type="text" required
                  value={fileSize} onChange={(e) => setFileSize(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Contoh: 1.5 MB"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat Berkas</label>
              <textarea 
                required rows="3"
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Jelaskan kegunaan dokumen ini agar dipahami pembaca..."
              ></textarea>
            </div>

            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {editingId ? 'Simpan Perubahan' : 'Publikasikan Dokumen'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nama Berkas</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kategori Dokumen</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kategori Divisi</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Format & Ukuran</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Modifikasi</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Oleh</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {procedures.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 text-sm">{item.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full uppercase tracking-wider ${item.category === 'Form' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {item.category || 'Prosedur'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded font-medium">
                    {item.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                  <span className="font-bold">{item.type}</span> ({item.size})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {item.modifyDate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-semibold">
                  {item.modifyBy || 'System'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded mr-2">
                    <Edit2 className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded">
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- APLIKASI UTAMA APPROVAL ---
const ApprovalSystemApp = ({ approvals, setApprovals, user, approvalTypes, routings, addLog }) => {
  const [notification, setNotification] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');
  
  const [activeTab, setActiveTab] = useState('my_requests'); 

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formType, setFormType] = useState('');
  const [actionComments, setActionComments] = useState({}); // State untuk menampung input komentar per item
  const [formDesc, setFormDesc] = useState('');
  const [formFile, setFormFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'pdf' && extension !== 'zip') {
        setErrorBanner('Format dokumen tidak valid! Hanya file dengan ekstensi PDF atau ZIP yang diperbolehkan.');
        e.target.value = ''; 
        setFormFile(null);
        return;
      }
      setErrorBanner('');
      setFormFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      });
    }
  };

  const handleDownload = (attachment) => {
    if (!attachment) return;
    try {
      const element = document.createElement("a");
      const file = new Blob([`Simulasi biner dokumen CORP Portal.\nNama File: ${attachment.name}\nUkuran: ${attachment.size}\nStatus: Terbaca Aman.`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = attachment.name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setNotification(`Mengunduh file: ${attachment.name}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setErrorBanner('Terjadi kesalahan saat mencoba mengunduh dokumen.');
    }
  };

  const handleCreateOrUpdateApproval = (e) => {
    e.preventDefault();
    if (!formType) {
      setErrorBanner('Silakan pilih Tipe Approval terlebih dahulu!');
      return;
    }

    if (editingId) {
      const updatedList = approvals.map(app => {
        if (app.id === editingId) {
          return {
            ...app,
            type: formType,
            description: formDesc,
            attachment: formFile || app.attachment
          };
        }
        return app;
      });
      setApprovals(updatedList);
      addLog('UPDATE', 'Sistem Approval', `Edit draft: ${formType}`);
      setNotification('Pengajuan berhasil diperbarui!');
    } else {
      const matchedRoute = routings.find(r => 
        r.approvalType === formType && 
        (r.department === user.department || r.department === 'Lintas Departemen')
      );

      const routingPath = matchedRoute ? matchedRoute.path.map(step => ({
        level: step.level,
        role: step.role,
        pic: step.pic,
        email: `${step.pic.toLowerCase().replace(/\s+/g, '')}@corp.com`
      })) : [
        { level: 1, role: "Supervisor", pic: "Siti Aminah", email: "siti.aminah@corp.com" },
        { level: 2, role: "Manager", pic: "Budi Santoso", email: "budi.santoso@corp.com" }
      ];

      const newRequest = {
        id: Date.now(),
        type: formType,
        requester: user.name,
        description: formDesc,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        currentStepIndex: 0,
        path: routingPath,
        attachment: formFile
      };

      setApprovals([newRequest, ...approvals]);
      addLog('CREATE', 'Sistem Approval', `Pengajuan baru: ${formType}`);
      setNotification(`Pengajuan berhasil dibuat! Email dikirim ke PIC tahap 1: ${routingPath[0].email}`);
    }

    setFormType('');
    setFormDesc('');
    setFormFile(null);
    setEditingId(null);
    setIsFormOpen(false);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleEditClick = (item) => {
    // Pengecekan Otoritas: Hanya pemilik yang boleh mengedit draf
    if (item.requester !== user.name) {
      setErrorBanner('Akses Ditolak! Anda hanya diperkenankan menyunting pengajuan yang Anda buat sendiri.');
      return;
    }
    setEditingId(item.id);
    setFormType(item.type);
    setFormDesc(item.description);
    setFormFile(item.attachment);
    setIsFormOpen(true);
  };

  const handleDeleteApproval = (id) => {
    const checkItem = approvals.find(a => a.id === id);
    if (!checkItem) return;

    // Pengecekan Otoritas: Hanya pembuat request yang diperkenankan menghapus/membatalkan
    if (checkItem.requester !== user.name) {
      setErrorBanner('Akses Ditolak! Hanya pembuat pengajuan yang diperkenankan untuk menghapus atau membatalkan request ini.');
      return;
    }

    if (checkItem.status !== 'Pending') {
      setErrorBanner('Pengajuan yang sudah diproses (Disetujui/Ditolak) tidak bisa dibatalkan atau dihapus!');
      return;
    }
    setApprovals(approvals.filter(a => a.id !== id));
    addLog('DELETE', 'Sistem Approval', `Membatalkan: ${checkItem.type}`);
    setNotification('Pengajuan berhasil dibatalkan dan dihapus.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = (id, newStatus) => {
    const comment = actionComments[id] || '';
    const itemIndex = approvals.findIndex(a => a.id === id);
    if (itemIndex === -1) return;
    const item = approvals[itemIndex];
    
    let updatedItem = { ...item };
    updatedItem.status = newStatus;
    updatedItem.lastComment = comment; // Menyimpan komentar terakhir

    if (newStatus === 'Approved') {
      if (item.path && item.currentStepIndex < item.path.length - 1) {
        updatedItem.currentStepIndex += 1;
        const nextPic = updatedItem.path[updatedItem.currentStepIndex];
        setNotification(`Email Notifikasi dikirim ke: ${nextPic.email} (PIC: ${nextPic.pic})`);
        setTimeout(() => setNotification(null), 4000);
      } else {
        updatedItem.status = 'Approved';
        addLog('UPDATE', 'Sistem Approval', `APPROVED: ${item.type}${comment ? ' - Pesan: ' + comment : ''}`);
        setNotification(`Approval Selesai! Email konfirmasi akhir dikirim ke Pengaju (${item.requester}).`);
        setTimeout(() => setNotification(null), 4000);
      }
    } else if (newStatus === 'Rejected') {
      updatedItem.status = 'Rejected';
      addLog('UPDATE', 'Sistem Approval', `REJECTED: ${item.type}${comment ? ' - Alasan: ' + comment : ''}`);
      setNotification(`Pengajuan Ditolak! Email pembatalan dikirim ke Pengaju (${item.requester}).`);
      setTimeout(() => setNotification(null), 4000);
    } else if (newStatus === 'Hold') {
      addLog('UPDATE', 'Sistem Approval', `HOLD: ${item.type} - Ket: ${comment}`);
      setNotification(`Pengajuan ditangguhkan (Hold). Komentar telah disimpan.`);
      setTimeout(() => setNotification(null), 4000);
    }

    const newApprovals = [...approvals];
    newApprovals[itemIndex] = updatedItem;
    setApprovals(newApprovals);
  };

  const myRequests = approvals.filter(a => a.requester === user.name);
  
  const inboxApprovals = approvals.filter(a => {
    if (a.status !== 'Pending') return false;
    const currentPIC = a.path?.[a.currentStepIndex];
    return currentPIC?.pic === user.name || user.role === 'administrator';
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Disetujui</span>;
      case 'Hold': return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Hold (Ditangguhkan)</span>;
      case 'Rejected': return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ditolak</span>;
      default: return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>;
    }
  };

  return (
    <div className="p-6 relative">
      {notification && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 z-50 border border-slate-700 animate-bounce">
          <div className="bg-blue-600 p-2 rounded-full"><Mail className="w-5 h-5 text-white" /></div>
          <div>
            <p className="font-bold text-sm text-blue-100">Notifikasi Sistem</p>
            <p className="text-xs text-white mt-1">{notification}</p>
          </div>
        </div>
      )}

      {errorBanner && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex justify-between items-center">
          <span className="text-sm font-medium">{errorBanner}</span>
          <button onClick={() => setErrorBanner('')} className="p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sistem Approval Berbasis Web</h2>
          <p className="text-sm text-slate-500">Ajukan permohonan baru, pantau status, atau proses persetujuan yang masuk.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => {
              const dataToExport = activeTab === 'my_requests' ? myRequests : inboxApprovals;
              const filename = activeTab === 'my_requests' ? 'Daftar_Pengajuan_Saya' : 'Daftar_Persetujuan_Masuk';
              exportToCSV(dataToExport, filename);
            }}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4 mr-2" /> Export Spreadsheet
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormType('');
              setFormDesc('');
              setFormFile(null);
              setIsFormOpen(!isFormOpen);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
          >
            {isFormOpen ? <X className="w-4 h-4 mr-2"/> : <PlusCircle className="w-4 h-4 mr-2"/>}
            {isFormOpen ? 'Batal' : 'Buat Pengajuan Baru'}
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 animate-fadeIn">
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b">
            {editingId ? 'Edit Draft Pengajuan' : 'Buat Pengajuan Baru'}
          </h3>
          <form onSubmit={handleCreateOrUpdateApproval}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipe Approval</label>
                <select 
                  required
                  value={formType} 
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">-- Pilih Tipe Approval --</option>
                  {approvalTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Unggah Dokumen Lampiran <span className="text-xs font-normal text-slate-400">(Hanya PDF / ZIP)</span></label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50">
                    <FileUp className="w-5 h-5 text-slate-500" />
                    <span className="text-sm text-slate-600 font-medium truncate">
                      {formFile ? formFile.name : 'Pilih file PDF atau ZIP'}
                    </span>
                    <input 
                      type="file" 
                      accept=".pdf,.zip" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  {formFile && (
                    <button 
                      type="button" 
                      onClick={() => setFormFile(null)} 
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan / Alasan Permohonan</label>
              <textarea 
                required 
                rows="3"
                value={formDesc} 
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Tulis alasan atau rincian detail pengajuan..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium w-full sm:w-auto"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold w-full sm:w-auto"
              >
                {editingId ? 'Simpan Perubahan' : 'Kirim Pengajuan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => setActiveTab('my_requests')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === 'my_requests' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Pengajuan Saya ({myRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all ${activeTab === 'inbox' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Persetujuan Masuk ({inboxApprovals.length})
        </button>
      </div>

      {activeTab === 'my_requests' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal & ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe & Keterangan</th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dokumen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Urutan</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {myRequests.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="font-bold text-slate-800">REQ-{item.id}</div>
                    <div>{item.date}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="font-bold text-slate-900">{item.type}</div>
                    <div className="text-slate-500 max-w-sm truncate" title={item.description}>
                      {item.description}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {item.attachment ? (
                      <button 
                        onClick={() => handleDownload(item.attachment)}
                        className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium w-fit transition-colors group"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="truncate max-w-[120px]">{item.attachment.name}</span>
                        <span className="text-[10px] text-blue-400">({item.attachment.size})</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Tidak ada lampiran</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                    {item.status === 'Pending' && item.path && (
                      <div className="text-[10px] text-slate-500 mt-2 font-medium bg-slate-100 p-1 rounded border border-slate-200">
                        Pending di: {item.path[item.currentStepIndex]?.pic} ({item.path[item.currentStepIndex]?.role})
                      </div>
                    )}
                    {item.attachment && (
                      <button 
                        onClick={() => handleDownload(item.attachment)}
                        className="lg:hidden mt-2 flex items-center text-blue-600 text-[10px] font-bold bg-blue-50 px-2 py-1 rounded"
                      >
                        <Download className="w-3 h-3 mr-1" /> Unduh Dokumen
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {item.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-lg" 
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteApproval(item.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-lg" 
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Selesai diproses</span>
                    )}
                  </td>
                </tr>
              ))}
              {myRequests.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic bg-white">
                    Anda belum pernah membuat pengajuan approval.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'inbox' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal & ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengaju & Keterangan</th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dokumen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahap / Menunggu</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi Keputusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {inboxApprovals.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="font-bold text-slate-800">REQ-{item.id}</div>
                    <div>{item.date}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="font-bold text-slate-900">{item.requester}</div>
                    <div className="text-xs text-blue-600 mb-1 font-semibold bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                      Tipe: {item.type}
                    </div>
                    <div className="text-slate-500 max-w-sm truncate" title={item.description}>
                      {item.description}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {item.attachment ? (
                      <button 
                        onClick={() => handleDownload(item.attachment)}
                        className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium w-fit transition-colors group"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="truncate max-w-[120px]">{item.attachment.name}</span>
                        <span className="text-[10px] text-blue-400">({item.attachment.size})</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Tanpa lampiran</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-xs font-medium">
                      Level {item.currentStepIndex + 1}: {item.path?.[item.currentStepIndex]?.role}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">PIC: {item.path?.[item.currentStepIndex]?.pic}</div>
                    {item.attachment && (
                      <button 
                        onClick={() => handleDownload(item.attachment)}
                        className="lg:hidden mt-2 flex items-center text-blue-600 text-[10px] font-bold bg-blue-50 px-2 py-1 rounded w-fit"
                      >
                        <Download className="w-3 h-3 mr-1" /> Unduh Dokumen
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="mb-3">
                      <input 
                        type="text" 
                        placeholder="Tambah komentar..."
                        value={actionComments[item.id] || ''}
                        onChange={(e) => setActionComments({ ...actionComments, [item.id]: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => handleAction(item.id, 'Approved')}
                        className="text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg flex items-center justify-center transition-colors border border-green-200" 
                        title="Setujui Pengajuan"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          if(!actionComments[item.id]) { alert('Harap isi komentar untuk alasan Hold!'); return; }
                          handleAction(item.id, 'Hold');
                        }}
                        className="text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-2 rounded-lg flex items-center justify-center transition-colors border border-orange-200" 
                        title="Hold / Tangguhkan"
                      >
                        <PauseCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, 'Rejected')}
                        className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg flex items-center justify-center transition-colors" 
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {inboxApprovals.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic bg-white">
                    Tidak ada permohonan persetujuan baru yang membutuhkan tindakan Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MasterDepartmentApp = ({ departments, setDepartments, addLog }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setDepartments(departments.map(d => d.id === editingId ? { ...d, code, name } : d));
      addLog('UPDATE', 'Master Departemen', name);
    } else {
      setDepartments([{ id: Date.now(), code, name }, ...departments]);
      addLog('CREATE', 'Master Departemen', name);
    }
    setCode(''); setName(''); setEditingId(null); setIsFormOpen(false);
  };

  const handleEdit = (d) => {
    setEditingId(d.id);
    setCode(d.code);
    setName(d.name);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-bold text-slate-800">Master Departemen</h2><p className="text-sm text-slate-500">Kelola data divisi/departemen.</p></div>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium">
          {isFormOpen ? 'Batal' : '+ Tambah Departemen'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end animate-fadeIn">
          <div className="w-full md:flex-1"><label className="block text-sm font-medium text-slate-700 mb-1">Kode Departemen</label><input required value={code} onChange={e => setCode(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="w-full md:flex-1"><label className="block text-sm font-medium text-slate-700 mb-1">Nama Departemen</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md font-medium h-[42px] w-full md:w-auto transition-colors hover:bg-green-700 shadow-sm">Simpan</button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kode</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama Departemen</th><th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th></tr></thead>
          <tbody className="divide-y divide-slate-200">
            {departments.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{d.code}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.name}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-900 mr-2"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => {
                    setDepartments(departments.filter(x => x.id !== d.id));
                    addLog('DELETE', 'Master Departemen', d.name);
                  }} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MasterApprovalTypeApp = ({ approvalTypes, setApprovalTypes, addLog }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setApprovalTypes(approvalTypes.map(t => t.id === editingId ? { ...t, code, name } : t));
      addLog('UPDATE', 'Master Tipe Approval', name);
    } else {
      setApprovalTypes([{ id: Date.now(), code, name }, ...approvalTypes]);
      addLog('CREATE', 'Master Tipe Approval', name);
    }
    setCode(''); setName(''); setEditingId(null); setIsFormOpen(false);
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setCode(t.code);
    setName(t.name);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-bold text-slate-800">Master Tipe Approval</h2><p className="text-sm text-slate-500">Kelola jenis dokumen/pengajuan persetujuan.</p></div>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">{isFormOpen ? 'Batal' : '+ Tambah Data'}</button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end animate-fadeIn">
          <div className="w-full md:flex-1"><label className="block text-sm font-medium text-slate-700 mb-1">Kode (Misal: LV)</label><input required value={code} onChange={e => setCode(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="w-full md:flex-1"><label className="block text-sm font-medium text-slate-700 mb-1">Nama Tipe (Misal: Cuti)</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md font-medium h-[42px] w-full md:w-auto transition-colors hover:bg-green-700 shadow-sm">Simpan</button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kode</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipe Approval</th><th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th></tr></thead>
          <tbody className="divide-y divide-slate-200">
            {approvalTypes.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{d.code}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.name}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-900 mr-2"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => {
                    setApprovalTypes(approvalTypes.filter(x => x.id !== d.id));
                    addLog('DELETE', 'Master Tipe Approval', d.name);
                  }} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MasterEmployeeApp = ({ employees, setEmployees, departments, addLog }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('Staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  const availableRoles = ['Staff', 'Supervisor', 'Manager', 'Director', 'administrator'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const updatedEmployees = employees.map(emp => 
        emp.id === editingId ? {
          ...emp,
          nik,
          name,
          email,
          department,
          role,
          username: username || emp.username,
          password: password || emp.password
        } : emp
      );
      setEmployees(updatedEmployees);
      addLog('UPDATE', 'Master Karyawan', name);
      setSuccessBanner('Data karyawan berhasil diperbarui.');
    } else {
      const newEmp = { 
        id: Date.now(), 
        nik, 
        name, 
        email, 
        department, 
        role,
        username: username || name.toLowerCase().replace(/\s+/g, ''), 
        password: password || 'password123'
      };
      setEmployees([newEmp, ...employees]);
      addLog('CREATE', 'Master Karyawan', name);
      setSuccessBanner('Data karyawan baru berhasil ditambahkan.');
    }
    
    setNik(''); setName(''); setEmail(''); 
    setDepartment(''); setRole('Staff');
    setUsername(''); setPassword('');
    setIsFormOpen(false);
    setEditingId(null);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const handleDownloadTemplate = () => {
    const csvHeader = "nik,name,email,department,role,username,password\n";
    const csvExample = "EMP999,Nama Lengkap,email@domain.com,Information Technology,Staff,usernameunik,passwordrahasia\n";
    const blob = new Blob([csvHeader + csvExample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_karyawan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessBanner('Template impor berhasil diunduh. Silakan isi data dan unggah kembali.');
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'csv') {
      setErrorBanner('File harus berformat CSV (.csv). Silakan gunakan template yang telah disediakan.');
      e.target.value = ''; 
      return;
    }

    setErrorBanner('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length <= 1) {
          setErrorBanner('Berkas kosong atau hanya berisi judul kolom (header).');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const importedEmployees = [];

        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',').map(c => c.trim());
          if (columns.length < headers.length) continue;

          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = columns[index] || '';
          });

          if (!rowData.nik || !rowData.name) {
            continue; 
          }

          importedEmployees.push({
            id: Date.now() + i,
            nik: rowData.nik,
            name: rowData.name,
            email: rowData.email || `${rowData.name.toLowerCase().replace(/\s+/g, '')}@corp.com`,
            department: rowData.department || 'Information Technology',
            role: rowData.role || 'Staff',
            username: rowData.username || rowData.name.toLowerCase().replace(/\s+/g, ''),
            password: rowData.password || 'password123'
          });
        }

        if (importedEmployees.length > 0) {
          setEmployees(prev => [...importedEmployees, ...prev]);
          addLog('CREATE', 'Master Karyawan', `Import ${importedEmployees.length} data`);
          setSuccessBanner(`Berhasil mengimpor ${importedEmployees.length} data karyawan baru.`);
          setTimeout(() => setSuccessBanner(''), 4000);
        } else {
          setErrorBanner('Format data di dalam berkas CSV tidak valid atau NIK dan Nama kosong.');
        }
      } catch (err) {
        setErrorBanner('Gagal mengurai file CSV. Pastikan pembatas yang digunakan adalah koma (,).');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const handleEditClick = (emp) => {
    setEditingId(emp.id);
    setNik(emp.nik);
    setName(emp.name);
    setEmail(emp.email);
    setDepartment(emp.department);
    setRole(emp.role);
    setUsername(emp.username || '');
    setPassword(''); // Kosongkan, isi hanya jika ingin mengganti
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Karyawan</h2>
          <p className="text-sm text-slate-500">Database identitas karyawan, peran jabatan, departemen, dan kredensial login.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button 
            onClick={handleDownloadTemplate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4 mr-2" /> Download Template
          </button>

          <label 
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-semibold shadow-sm transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            <FileUp className="w-4 h-4 mr-2" /> Import Karyawan
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              className="hidden" 
            />
          </label>

          <button 
            onClick={() => exportToCSV(employees, 'Data_Karyawan')}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4 mr-2" /> Export Spreadsheet
          </button>

          <button 
            onClick={() => {
              if (isFormOpen) {
                setEditingId(null);
                setNik(''); setName(''); setEmail(''); setUsername(''); setPassword('');
                setIsFormOpen(false);
              } else {
                setIsFormOpen(true);
              }
            }} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
          >
            {isFormOpen ? 'Batal' : '+ Tambah Data'}
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex justify-between items-center">
          <span className="text-sm font-medium">{successBanner}</span>
          <button onClick={() => setSuccessBanner('')} className="p-1 hover:bg-green-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex justify-between items-center">
          <span className="text-sm font-medium">{errorBanner}</span>
          <button onClick={() => setErrorBanner('')} className="p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">NIK</label><input required value={nik} onChange={e => setNik(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Email Karyawan</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" /></div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
            <select required value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">-- Pilih Dept --</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Level / Role</label>
            <select required value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500">
              {availableRoles.map(r => <option key={r} value={r}>{r === 'administrator' ? 'Administrator (Super)' : r}</option>)}
            </select>
          </div>

          <div className="border-t border-slate-100 md:col-span-2 my-2 pt-4">
            <h4 className="font-bold text-slate-800 text-sm mb-2">Akses Kredensial Login</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Username Login</label>
                <input 
                  type="text" 
                  placeholder="Contoh: budis" 
                  value={username} onChange={e => setUsername(e.target.value)} 
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder={editingId ? "Biarkan kosong jika tidak ingin mengubah" : "Kosongkan untuk default: password123"} 
                  value={password} onChange={e => setPassword(e.target.value)} 
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>

          <div className="col-span-2 flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors shadow-sm">{editingId ? 'Update Data Karyawan' : 'Simpan Karyawan'}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">NIK / Nama / Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Departemen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role / Posisi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employees.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{d.name}</div>
                  <div className="text-xs text-slate-500">NIK: {d.nik}</div>
                  <div className="text-[10px] text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded inline-block mt-1">Username: {d.username || d.name.toLowerCase().replace(/\s+/g, '')}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.email}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.department}</td>
                <td className="px-6 py-4 text-sm text-slate-500"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">{d.role === 'administrator' ? 'Administrator' : d.role}</span></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditClick(d)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded transition-colors" title="Edit Data"><Edit2 className="w-4 h-4 inline" /></button>
                    <button onClick={() => {
                      setEmployees(employees.filter(x => x.id !== d.id));
                      addLog('DELETE', 'Master Karyawan', d.name);
                    }} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded transition-colors" title="Hapus"><Trash2 className="w-4 h-4 inline" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MasterRoutingApp = ({ routings, setRoutings, approvalTypes, departments, employees, addLog }) => {
  const [isFormOpen, setIsSEFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    approvalType: '',
    department: '',
    path: [{ level: 1, role: 'Supervisor', pic: '' }]
  });

  const availableRoles = ['Staff', 'Supervisor', 'Manager', 'Director', 'administrator'];

  const handleAddStep = () => {
    setFormData({
      ...formData,
      path: [...formData.path, { level: formData.path.length + 1, role: 'Manager', pic: '' }]
    });
  };

  const handleRemoveStep = (index) => {
    const newPath = formData.path.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      level: i + 1
    }));
    setFormData({ ...formData, path: newPath });
  };

  const handleStepChange = (index, field, value) => {
    const newPath = [...formData.path];
    newPath[index][field] = value;
    setFormData({ ...formData, path: newPath });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setRoutings(routings.map(r => r.id === editingId ? { ...formData, id: editingId } : r));
      addLog('UPDATE', 'Master Routing PIC', formData.approvalType);
    } else {
      const newRouting = {
        id: Date.now(),
        ...formData
      };
      setRoutings([...routings, newRouting]);
      addLog('CREATE', 'Master Routing PIC', formData.approvalType);
    }
    
    setFormData({ approvalType: '', department: 'Internal Departemen', path: [{ level: 1, role: 'Supervisor', pic: '' }] });
    setEditingId(null);
    setIsSEFormOpen(false);
  };

  const handleDelete = (item) => {
    setRoutings(routings.filter(r => r.id !== item.id));
    addLog('DELETE', 'Master Routing PIC', item.approvalType);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ approvalType: item.approvalType, department: item.department, path: [...item.path] });
    setIsSEFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Routing PIC Approval</h2>
          <p className="text-sm text-slate-500">Atur hirarki persetujuan per tipe pengajuan (Lintas Departemen / Internal).</p>
        </div>
        <button 
          onClick={() => setIsSEFormOpen(!isFormOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
        >
          {isFormOpen ? <X className="w-4 h-4 mr-2"/> : <PlusCircle className="w-4 h-4 mr-2"/>}
          {isFormOpen ? 'Batal' : '+ Tambah Routing'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mb-8 animate-fadeIn">
          <h3 className="text-lg font-bold mb-4 flex items-center text-slate-800 border-b pb-2">
            <GitMerge className="w-5 h-5 mr-2 text-blue-600" /> {editingId ? 'Edit Setup Routing' : 'Form Setup Routing Baru'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Pengajuan (Approval Type)</label>
                <select 
                  required
                  value={formData.approvalType} onChange={(e) => setFormData({...formData, approvalType: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                >
                  <option value="">-- Pilih Tipe Approval --</option>
                  {approvalTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.code} - {type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sifat Routing / Departemen</label>
                <select 
                  required
                  value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                >
                  <option value="">-- Pilih Departemen / Sifat --</option>
                  <option value="Lintas Departemen">Lintas Departemen / Global</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.code} - {dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-slate-700">Definisi Jalur (Path) Hirarki</label>
                <button type="button" onClick={handleAddStep} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold hover:bg-blue-200">
                  + Tambah Level
                </button>
              </div>
              
              <datalist id="employee-options">
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.role} - {emp.department}</option>
                ))}
              </datalist>

              <div className="space-y-3">
                {formData.path.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border border-slate-200 animate-fadeIn">
                    <div className="bg-slate-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {step.level}
                    </div>
                    <div className="w-1/3">
                      <select 
                        value={step.role} onChange={(e) => handleStepChange(index, 'role', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded outline-none focus:border-blue-500 bg-white"
                      >
                        {availableRoles.map(r => <option key={r} value={r}>{r === 'administrator' ? 'Administrator' : r}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text"
                        list="employee-options"
                        required
                        placeholder="Ketik nama karyawan..."
                        value={step.pic} onChange={(e) => handleStepChange(index, 'pic', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded outline-none focus:border-blue-500"
                      />
                    </div>
                    {formData.path.length > 1 && (
                      <button type="button" onClick={() => handleRemoveStep(index)} className="text-red-500 hover:text-red-700 p-1 shrink-0">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium flex items-center">
                <Save className="w-4 h-4 mr-2" /> {editingId ? 'Update Routing' : 'Simpan Routing'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {routings.map((route) => (
          <div key={route.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg text-slate-800">{route.approvalType}</h4>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${route.department === 'Lintas Departemen' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {route.department}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(route)} className="text-blue-500 hover:text-blue-700 p-1.5 bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(route)} className="text-red-400 hover:text-red-600 p-1.5 bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-slate-300 rounded-lg min-w-[120px] bg-slate-50">
                  <Users className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-500">Karyawan</span>
                  <span className="text-[10px] text-slate-400">(Pembuat Request)</span>
                </div>
                
                {route.path.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                    <div className="flex flex-col items-center justify-center p-3 border border-blue-200 rounded-lg min-w-[140px] bg-blue-50 shadow-sm relative">
                      <div className="absolute -top-3 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
                        {step.level}
                      </div>
                      <span className="text-xs font-bold text-blue-800 mb-1">{step.role === 'administrator' ? 'Administrator' : step.role}</span>
                      <span className="text-xs text-blue-600 text-center">{step.pic}</span>
                    </div>
                  </React.Fragment>
                ))}
                
                <ArrowRight className="w-5 h-5 text-green-300" />
                <div className="flex flex-col items-center justify-center p-2 border border-green-200 rounded-lg min-w-[100px] bg-green-50 shadow-sm">
                  <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
                  <span className="text-xs font-bold text-green-700">Selesai</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {routings.length === 0 && (
          <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-slate-200">
            Belum ada data Master Routing yang dibuat.
          </div>
        )}
      </div>
    </div>
  );
};

// --- APLIKASI INTERNAL DASHBOARD: LOG PERUBAHAN ---
const AuditLogApp = ({ logs }) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Log Perubahan Audit (CRUD Tracking)</h2>
        <p className="text-sm text-slate-500">Riwayat aktifitas modifikasi data pada sistem secara mendetail.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu Modifikasi</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pelaku (Modify By)</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Aksi</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Menu Asal</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan Aktivitas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.modifyDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{log.modifyBy}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    log.actionType === 'CREATE' ? 'bg-green-100 text-green-700' :
                    log.actionType === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 
                    log.actionType === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {log.actionType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{log.menuAsal}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{log.description}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic bg-white">
                  Belum ada riwayat perubahan data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- APLIKASI HAK AKSES PERAN ---
const RoleAccessManagerApp = ({ roleAccess, setRoleAccess, addLog }) => {
  const roles = ['Staff', 'Supervisor', 'Manager', 'Director', 'administrator'];
  const [successMsg, setSuccessMsg] = useState('');

  const handleCheckboxChange = (role, menuId) => {
    if (role === 'administrator' && menuId === 'master_role_access') {
      setSuccessMsg('Akses menu utama kontrol hak akses wajib aktif untuk role Administrator.');
      setTimeout(() => setSuccessMsg(''), 4000);
      return;
    }

    const currentAllowedMenus = roleAccess[role] || [];
    let updatedMenus = [];

    if (currentAllowedMenus.includes(menuId)) {
      updatedMenus = currentAllowedMenus.filter(id => id !== menuId);
    } else {
      updatedMenus = [...currentAllowedMenus, menuId];
    }

    setRoleAccess({
      ...roleAccess,
      [role]: updatedMenus
    });

    const displayRoleName = role === 'administrator' ? 'Administrator' : role;
    addLog('UPDATE', 'Role Access', `Role ${displayRoleName} menu ${menuId}`);
    setSuccessMsg(`Perubahan akses menu untuk role ${displayRoleName} berhasil disimpan.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Master Role Access Control</h2>
        <p className="text-xs md:text-sm text-slate-500">Tentukan menu mana saja yang dapat diakses oleh masing-masing level jabatan (Termasuk Akun Administrator).</p>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Nama Menu \ Level Role</th>
              {roles.map(r => (
                <th key={r} className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase bg-slate-100 whitespace-nowrap">
                  {r === 'administrator' ? 'Administrator' : r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {ALL_MENUS.map(menu => {
              return (
                <tr key={menu.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-slate-500 mr-2">{menu.icon}</span>
                      <span className="text-sm font-semibold text-slate-800">{menu.label}</span>
                    </div>
                  </td>
                  {roles.map(role => {
                    const isChecked = (roleAccess[role] || []).includes(menu.id);
                    return (
                      <td key={role} className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(role, menu.id)}
                          className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-bold">Informasi Keamanan & Hak Istimewa:</p>
          <p className="mt-1">Penyusunan hak akses ini membatasi sidebar secara real-time. Untuk keamanan sistem, menu <b>Role Access (Hak Akses)</b> harus selalu aktif pada role Administrator agar Anda tidak terkunci keluar dari pengaturan.</p>
        </div>
      </div>
    </div>
  );
};

// --- LAYOUT UTAMA DASHBOARD ---
const DashboardLayout = ({ user, onLogout, children, activeMenu, setActiveMenu, roleAccess, approvals = [] }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userAllowedMenus = roleAccess[user.role] || [];
  
  const filteredMenuItems = ALL_MENUS.filter(item => {
    if (user.role === 'administrator' && item.id === 'master_role_access') return true;
    return userAllowedMenus.includes(item.id);
  });

  const pendingCount = approvals.filter(a => {
    if (a.status !== 'Pending') return false;
    const currentPIC = a.path?.[a.currentStepIndex];
    return currentPIC?.pic === user.name || user.role === 'administrator';
  }).length;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'} fixed lg:relative z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col h-full shrink-0 shadow-2xl lg:shadow-none`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          {isSidebarOpen && <span className="font-bold text-lg tracking-wider">CORP<span className="text-blue-400">SYS</span></span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-800 shrink-0">
          {isSidebarOpen ? (
            <div>
              <p className="text-xs font-semibold uppercase text-blue-400">{user.role === 'administrator' ? 'Administrator' : user.role}</p>
              <p className="font-bold text-white truncate mt-0.5">{user.name}</p>
              {user.department && <p className="text-[11px] text-slate-400">Dept: {user.department}</p>}
            </div>
          ) : (
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold mx-auto text-sm shadow-md">
               {user.name.charAt(0)}
             </div>
          )}
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isApprovalMenu = item.id === 'dashboard_approval';
            const showNotification = isApprovalMenu && pendingCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-3 rounded-md transition-colors w-full ${
                  activeMenu === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center min-w-0">
                  <span className="shrink-0 relative">
                    {item.icon}
                    {showNotification && !isSidebarOpen && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                  </span>
                  {isSidebarOpen && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
                </div>

                {showNotification && isSidebarOpen && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Bell className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 shrink-0">
          <button 
            onClick={onLogout}
            className="flex items-center justify-center w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-2 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center px-6 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 mr-4 bg-slate-100 rounded-lg text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">
            {ALL_MENUS.find(m => m.id === activeMenu)?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto bg-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('portal');
  const [activeDashboardMenu, setActiveDashboardMenu] = useState('dashboard_home');
  const [user, setUser] = useState(null);
  
  const [news, setNews] = useState(INITIAL_NEWS);
  const [procedures, setProcedures] = useState(INITIAL_PROCEDURES); // State Berkas Prosedur
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [routings, setRoutings] = useState(INITIAL_ROUTING);
  
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [approvalTypes, setApprovalTypes] = useState(INITIAL_APPROVAL_TYPES);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);

  const [roleAccess, setRoleAccess] = useState(INITIAL_ROLE_ACCESS);
  const [auditLogs, setAuditLogs] = useState([]);

  const addLog = (actionType, menuAsal, entityName) => {
    const newLog = {
      id: Date.now(),
      modifyDate: new Date().toLocaleString('id-ID'),
      modifyBy: user ? user.name : 'System',
      actionType, // 'CREATE', 'UPDATE', 'DELETE'
      menuAsal,
      description: `${actionType} pada ${menuAsal}: ${entityName}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    addLog('LOGIN', 'User Session', userData.name);
    setCurrentView('dashboard');
    setActiveDashboardMenu('dashboard_home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('portal');
  };

  // --- LOGIKA AUTO LOGOUT (INACTIVITY TRACKING) ---
  useEffect(() => {
    // Fitur ini hanya aktif jika pengguna sudah login
    if (!user) return;

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Set timer untuk memicu auto logout
      timeoutId = setTimeout(() => {
        handleLogout();
        alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit. Silakan login kembali.');
      }, INACTIVITY_TIMEOUT);
    };

    // Pantau berbagai interaksi pengguna sebagai tanda aktivitas
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer(); // Jalankan timer awal saat pengguna masuk ke dashboard

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  if (currentView === 'login') {
    return <LoginPage onLogin={handleLoginSuccess} onBack={() => setCurrentView('portal')} employees={employees} />;
  }

  if (currentView === 'dashboard' && user) {
    return (
      <DashboardLayout 
        user={user} 
        onLogout={handleLogout}
        activeMenu={activeDashboardMenu}
        setActiveMenu={setActiveDashboardMenu}
        roleAccess={roleAccess}
        approvals={approvals}
      >
        {activeDashboardMenu === 'dashboard_home' && (
          <div className="p-6">
             <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl p-8 text-white shadow-lg mb-6">
                <h2 className="text-3xl font-bold mb-2">Sistem Informasi Eksekutif</h2>
                <p className="text-blue-100">Selamat datang kembali di panel internal organisasi Anda. Kelola data dan ajukan permohonan dengan praktis.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setActiveDashboardMenu('dashboard_news')}>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Berita</h3>
                    <p className="text-3xl font-extrabold text-blue-600 mt-2">{news.length}</p>
                  </div>
                  <Newspaper className="w-10 h-10 text-blue-100 shrink-0" />
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setActiveDashboardMenu('dashboard_docs')}>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prosedur & Form</h3>
                    <p className="text-3xl font-extrabold text-emerald-600 mt-2">{procedures.length}</p>
                  </div>
                  <FolderOpen className="w-10 h-10 text-emerald-100 shrink-0" />
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setActiveDashboardMenu('dashboard_approval')}>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Approval Pending</h3>
                    <p className="text-3xl font-extrabold text-yellow-500 mt-2">
                      {approvals.filter(a => a.status === 'Pending').length}
                    </p>
                  </div>
                  <FileText className="w-10 h-10 text-yellow-100 shrink-0" />
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setActiveDashboardMenu('dashboard_routing')}>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Routing Aktif</h3>
                    <p className="text-3xl font-extrabold text-purple-600 mt-2">{routings.length}</p>
                  </div>
                  <GitMerge className="w-10 h-10 text-purple-100 shrink-0" />
               </div>
             </div>
          </div>
        )}
        {activeDashboardMenu === 'dashboard_news' && (
          <NewsManagerApp news={news} setNews={setNews} addLog={addLog} user={user} />
        )}
        {activeDashboardMenu === 'dashboard_docs' && (
          <FormProcedureManagerApp 
            procedures={procedures} 
            setProcedures={setProcedures} 
            departments={departments} 
            addLog={addLog}
            user={user}
          />
        )}
        {activeDashboardMenu === 'dashboard_approval' && (
          <ApprovalSystemApp 
            approvals={approvals} 
            setApprovals={setApprovals} 
            user={user}
            approvalTypes={approvalTypes}
            routings={routings}
            addLog={addLog}
          />
        )}
        
        {activeDashboardMenu === 'master_department' && (
          <MasterDepartmentApp departments={departments} setDepartments={setDepartments} addLog={addLog} />
        )}
        {activeDashboardMenu === 'master_approval_type' && (
          <MasterApprovalTypeApp approvalTypes={approvalTypes} setApprovalTypes={setApprovalTypes} addLog={addLog} />
        )}
        {activeDashboardMenu === 'master_employee' && (
          <MasterEmployeeApp employees={employees} setEmployees={setEmployees} departments={departments} addLog={addLog} />
        )}

        {activeDashboardMenu === 'dashboard_routing' && (
          <MasterRoutingApp 
            routings={routings} 
            setRoutings={setRoutings} 
            approvalTypes={approvalTypes} 
            departments={departments} 
            employees={employees} 
            addLog={addLog}
          />
        )}

        {activeDashboardMenu === 'master_role_access' && (
          <RoleAccessManagerApp roleAccess={roleAccess} setRoleAccess={setRoleAccess} addLog={addLog} />
        )}

        {activeDashboardMenu === 'dashboard_logs' && (
          <AuditLogApp logs={auditLogs} />
        )}
      </DashboardLayout>
    );
  }

  // Portal Publik Utama (Desain Multi-Tab: Berita & Artikel VS Form & Prosedur)
  return (
    <PortalPage 
      news={news} 
      procedures={procedures} 
      departments={departments}
      onNavigate={() => setCurrentView('portal')} 
      // Mengarahkan ke halaman login yang memiliki keamanan CAPTCHA baru
      onLoginClick={() => setCurrentView('login')} 
    />
  );
}