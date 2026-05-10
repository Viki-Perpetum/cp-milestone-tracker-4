import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Clock, FileWarning, Search, Eye, Building2, Landmark, HardHat } from "lucide-react";

type RiskLevel = "blocked" | "at-risk" | "on-track" | "complete";

interface Deliverable {
  name: string;
  status: "missing" | "pending" | "received" | "approved";
  dueDate: string;
}

interface CPRecord {
  id: string;
  name: string;
  contractor: string;
  belfiusCondition: string;
  drawdownDeadline: string;
  risk: RiskLevel;
  progress: number;
  deliverables: Deliverable[];
  finance: string;
  legal: string;
  pm: string;
}

const MOCK_DATA: CPRecord[] = [
  {
    id: "CP-001",
    name: "Foundation & Earthworks",
    contractor: "Bouygues Construction SA",
    belfiusCondition: "BC-14: Structural warranty certificate",
    drawdownDeadline: "2024-07-15",
    risk: "blocked",
    progress: 45,
    finance: "Sophie Marlowe",
    legal: "Dries Van Aert",
    pm: "Koen Desmet",
    deliverables: [
      { name: "Structural warranty cert", status: "missing", dueDate: "2024-06-28" },
      { name: "Site inspection report", status: "received", dueDate: "2024-06-20" },
      { name: "Insurance certificate", status: "missing", dueDate: "2024-06-25" },
      { name: "Progress photo pack", status: "approved", dueDate: "2024-06-15" }
    ]
  },
  {
    id: "CP-002",
    name: "Structural Steel Frame",
    contractor: "ArcelorMittal Projects NV",
    belfiusCondition: "BC-22: Engineer sign-off on frame",
    drawdownDeadline: "2024-08-01",
    risk: "at-risk",
    progress: 62,
    finance: "Sophie Marlowe",
    legal: "Lena Baert",
    pm: "Pieter Claes",
    deliverables: [
      { name: "Engineer sign-off", status: "pending", dueDate: "2024-07-10" },
      { name: "Weld inspection log", status: "received", dueDate: "2024-07-05" },
      { name: "Material test certs", status: "approved", dueDate: "2024-06-30" },
      { name: "Revised drawings rev.3", status: "pending", dueDate: "2024-07-08" }
    ]
  },
  {
    id: "CP-003",
    name: "MEP Rough-In",
    contractor: "Cofely Fabricom BV",
    belfiusCondition: "BC-31: MEP compliance checklist",
    drawdownDeadline: "2024-09-15",
    risk: "on-track",
    progress: 30,
    finance: "Tom Verbeke",
    legal: "Dries Van Aert",
    pm: "Koen Desmet",
    deliverables: [
      { name: "MEP compliance checklist", status: "pending", dueDate: "2024-09-01" },
      { name: "Subcontractor list", status: "approved", dueDate: "2024-07-20" },
      { name: "HVAC design approval", status: "received", dueDate: "2024-08-01" },
      { name: "Electrical load calc", status: "received", dueDate: "2024-07-25" }
    ]
  },
  {
    id: "CP-004",
    name: "Facade & Glazing",
    contractor: "Permasteelisa Group NV",
    belfiusCondition: "BC-40: Thermal performance cert",
    drawdownDeadline: "2024-10-01",
    risk: "complete",
    progress: 100,
    finance: "Tom Verbeke",
    legal: "Lena Baert",
    pm: "Pieter Claes",
    deliverables: [
      { name: "Thermal performance cert", status: "approved", dueDate: "2024-05-15" },
      { name: "Mock-up test report", status: "approved", dueDate: "2024-05-10" },
      { name: "Installation manual", status: "approved", dueDate: "2024-05-20" },
      { name: "Warranty documentation", status: "approved", dueDate: "2024-05-25" }
    ]
  },
  {
    id: "CP-005",
    name: "Interior Fit-Out Phase 1",
    contractor: "ISS Facility Services SA",
    belfiusCondition: "BC-55: Interior design approval",
    drawdownDeadline: "2024-11-01",
    risk: "at-risk",
    progress: 18,
    finance: "Sophie Marlowe",
    legal: "Dries Van Aert",
    pm: "Koen Desmet",
    deliverables: [
      { name: "Interior design approval", status: "missing", dueDate: "2024-10-10" },
      { name: "Material sample board", status: "pending", dueDate: "2024-10-01" },
      { name: "Fire rating certs", status: "pending", dueDate: "2024-10-05" },
      { name: "Programme of works", status: "received", dueDate: "2024-09-15" }
    ]
  }
];

const riskConfig: Record<RiskLevel, { label: string; color: string; icon: React.ReactNode }> = {
  blocked: { label: "Blocked", color: "bg-destructive/15 text-destructive border-destructive/30", icon: <AlertTriangle className="w-3 h-3" /> },
  "at-risk": { label: "At Risk", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
  "on-track": { label: "On Track", color: "bg-primary/10 text-primary border-primary/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  complete: { label: "Complete", color: "bg-green-500/15 text-green-600 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" /> }
};

const deliverableStatusColor: Record<string, string> = {
  missing: "bg-destructive/15 text-destructive border-destructive/30",
  pending: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  received: "bg-primary/10 text-primary border-primary/30",
  approved: "bg-green-500/15 text-green-600 border-green-500/30"
};

function ProgressBar({ value }: { value: number }) {
  const color = value === 100 ? "bg-green-500" : value < 30 ? "bg-destructive" : "bg-primary";
  return (
    <div className="w-full bg-border rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function CpMilestoneTracker() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<CPRecord | null>(null);

  const filtered = useMemo(() => {
    return MOCK_DATA.filter(cp => {
      const matchSearch = cp.name.toLowerCase().includes(search.toLowerCase()) ||
        cp.contractor.toLowerCase().includes(search.toLowerCase()) ||
        cp.id.toLowerCase().includes(search.toLowerCase());
      const matchTab = tab === "all" || cp.risk === tab;
      return matchSearch && matchTab;
    });
  }, [search, tab]);

  const kpis = useMemo(() => ({
    total: MOCK_DATA.length,
    blocked: MOCK_DATA.filter(c => c.risk === "blocked").length,
    atRisk: MOCK_DATA.filter(c => c.risk === "at-risk").length,
    missingDocs: MOCK_DATA.flatMap(c => c.deliverables).filter(d => d.status === "missing").length
  }), []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-foreground">CP Milestone Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">Construction Package status, Belfius financing conditions & contractor deliverables — single source of truth.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />Total CPs</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-foreground">{kpis.total}</p></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-destructive" />Blocked</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-destructive">{kpis.blocked}</p></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-yellow-500" />At Risk</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-yellow-500">{kpis.atRisk}</p></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><FileWarning className="w-3.5 h-3.5 text-destructive" />Missing Docs</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-destructive">{kpis.missingDocs}</p></CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search CP, contractor…" className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="blocked">Blocked</TabsTrigger>
                <TabsTrigger value="at-risk">At Risk</TabsTrigger>
                <TabsTrigger value="on-track">On Track</TabsTrigger>
                <TabsTrigger value="complete">Complete</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="pl-5">ID</TableHead>
                <TableHead>Package Name</TableHead>
                <TableHead className="hidden md:table-cell">Contractor</TableHead>
                <TableHead className="hidden lg:table-cell">Belfius Condition</TableHead>
                <TableHead className="hidden md:table-cell">Drawdown</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No construction packages match your filter.</TableCell></TableRow>
              )}
              {filtered.map(cp => {
                const rc = riskConfig[cp.risk];
                return (
                  <TableRow key={cp.id} className="border-border hover:bg-accent/30 transition-colors">
                    <TableCell className="pl-5 font-mono text-xs text-muted-foreground">{cp.id}</TableCell>
                    <TableCell className="font-medium text-foreground">{cp.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{cp.contractor}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[180px] truncate">{cp.belfiusCondition}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{cp.drawdownDeadline}</TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={cp.progress} />
                        <span className="text-xs text-muted-foreground w-8">{cp.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit border ${rc.color}`}>{rc.icon}{rc.label}</Badge>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setSelected(cp)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <HardHat className="w-5 h-5 text-primary" />
                              {cp.id} — {cp.name}
                            </DialogTitle>
                          </DialogHeader>
                          {selected && (
                            <div className="space-y-4 text-sm">
                              <div className="grid grid-cols-2 gap-3">
                                <div><p className="text-xs text-muted-foreground mb-0.5">Contractor</p><p className="font-medium text-foreground">{cp.contractor}</p></div>
                                <div><p className="text-xs text-muted-foreground mb-0.5">Drawdown Deadline</p><p className="font-medium text-foreground">{cp.drawdownDeadline}</p></div>
                                <div><p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1"><Landmark className="w-3 h-3" />Belfius Condition</p><p className="font-medium text-foreground">{cp.belfiusCondition}</p></div>
                                <div><p className="text-xs text-muted-foreground mb-0.5">Risk Status</p><Badge variant="outline" className={`text-xs border ${riskConfig[cp.risk].color}`}>{riskConfig[cp.risk].label}</Badge></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 bg-muted/40 rounded-md p-3">
                                <div><p className="text-xs text-muted-foreground">Finance</p><p className="text-xs font-medium text-foreground">{cp.finance}</p></div>
                                <div><p className="text-xs text-muted-foreground">Legal</p><p className="text-xs font-medium text-foreground">{cp.legal}</p></div>
                                <div><p className="text-xs text-muted-foreground">PM</p><p className="text-xs font-medium text-foreground">{cp.pm}</p></div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-2">Deliverables</p>
                                <div className="space-y-2">
                                  {cp.deliverables.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between bg-card border border-border rounded px-3 py-2">
                                      <div>
                                        <p className="text-xs font-medium text-foreground">{d.name}</p>
                                        <p className="text-xs text-muted-foreground">Due {d.dueDate}</p>
                                      </div>
                                      <Badge variant="outline" className={`text-xs border capitalize ${deliverableStatusColor[d.status]}`}>{d.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
