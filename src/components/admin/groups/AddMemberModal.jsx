import { useEffect, useState } from "react";
import ResponsiveModal from "../../ui/ResponsiveModal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { searchUsers } from "../../../services/user.service";
import { addGroupMember } from "../../../services/group.service";
import { showToast } from "../../../utils/toast";

/** Authorized managers can enroll a farmer directly, with no application. */
export default function AddMemberModal({ open, onClose, groupId, onAdded }) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open || query.trim().length < 2) { setCandidates([]); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const results = await searchUsers(query.trim(), { includeSelf: true });
        if (!cancelled) setCandidates(results.filter((user) => user.role === "farmer" && user.status !== "suspended"));
      } catch (err) { if (!cancelled) setError(err?.message || "Search unavailable"); }
      finally { if (!cancelled) setLoading(false); }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, open]);
  async function add(user) {
    try {
      setAdding(user.uid);
      await addGroupMember(groupId, user.uid);
      showToast.success("Farmer added to group");
      onAdded?.(); setQuery(""); onClose();
    } catch (err) { showToast.error(err?.message || "Cannot add farmer. Check if they belong to another group."); }
    finally { setAdding(""); }
  }
  return <ResponsiveModal open={open} onClose={onClose} title="Add farmer to group" maxWidth="max-w-lg">
    <div className="space-y-3 py-3">
      <p className="text-sm text-(--agri-text-secondary)">Find an eligible farmer by name or username. Adding them immediately establishes an approved membership; farmers can belong to only one group.</p>
      <Input label="Search farmers" autoFocus value={query} onChange={(event) => setQuery(event.target.value)}
        placeholder="At least two characters" icon="ri-search-line" />
      {loading && <p role="status" className="text-xs text-(--agri-text-muted)">Searching…</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="max-h-[50dvh] space-y-2 overflow-y-auto">
        {candidates.map((candidate) => <div key={candidate.uid} className="flex items-center gap-3 rounded-xl border border-(--agri-border) p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-(--agri-text)">{candidate.fullname || candidate.username || "Farmer"}</p>
            <p className="truncate text-xs text-(--agri-text-muted)">@{candidate.username || candidate.email || "—"}</p>
          </div>
          <Button size="sm" variant="primary" loading={adding === candidate.uid} disabled={Boolean(adding)} onClick={() => add(candidate)}>Add</Button>
        </div>)}
        {query.trim().length >= 2 && !loading && !error && candidates.length === 0 && <p className="p-4 text-center text-sm text-(--agri-text-muted)">No eligible farmers found for this search.</p>}
      </div>
      <div className="flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>
    </div>
  </ResponsiveModal>;
}
