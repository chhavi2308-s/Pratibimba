import { useEffect, useRef, useState } from "react";
import api from "../services/api";

type Review = { token: string; leadDropped?: boolean; coordinatorDropped?: boolean };
type Props = { findingId: string; files?: string[]; leadFiles?: string[]; reviews?: Review[]; stage?: "lead" | "coordinator"; canUpload?: boolean; onUploaded?: () => Promise<void> | void };
export default function FindingEvidence({ findingId, files=[], leadFiles=[], reviews=[], stage, canUpload=false, onUploaded }: Props) {
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [preview,setPreview] = useState<{url:string;type:string;name:string}|null>(null);
  const [reviewState,setReviewState] = useState(reviews);
  const [confirm,setConfirm] = useState<string|null>(null);
  const names: Record<string,string> = {};
  const previewUrl = useRef<string|null>(null);
  useEffect(()=>{setReviewState(reviews)},[reviews]);
  useEffect(()=>()=>{if(previewUrl.current) URL.revokeObjectURL(previewUrl.current)},[]);
  const all = [...new Set([...files,...leadFiles])];
  const status=(token:string)=>reviewState.find(r=>r.token===token);
  const dropped=(token:string)=>Boolean(status(token)?.leadDropped || status(token)?.coordinatorDropped);
  async function upload(file:File) {
    setError("");
    if(file.size>8*1024*1024 || !["application/pdf","image/png","image/jpeg","image/webp"].includes(file.type)) {setError("Choose a PDF or JPEG/PNG/WebP under 8 MB.");return;}
    const form=new FormData();form.append("file",file);
    try{setBusy(true);await api.post(`/audit-findings/${findingId}/evidence`,form);await onUploaded?.();}
    catch(e:any){setError(e?.response?.data?.message||e?.message||"Upload failed");}
    finally{setBusy(false);}
  }
  async function openFile(token:string) {
    if(!token.startsWith("evidence:")) return;
    try {
      setError("");
      const id=token.slice(9);
      const response=await api.get(`/audit-findings/${findingId}/evidence/${id}`,{responseType:"blob"});
      const blob=response.data as Blob;
      if(previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      const url=URL.createObjectURL(blob);previewUrl.current=url;
      setPreview({url,type:blob.type,name:names[token]||`Evidence ${all.indexOf(token)+1}`});
    }catch(e:any){setError(e?.response?.data?.message||"Unable to preview file");}
  }
  async function decide(token:string,drop:boolean) {
    if(!stage || !token.startsWith("evidence:"))return;
    try {
      setBusy(true);setError("");
      const response=await api.patch(`/audit-findings/${findingId}/evidence/${token.slice(9)}/review`,{drop});
      setReviewState(response.data?.data||[]);await onUploaded?.();
    }catch(e:any){setError(e?.response?.data?.message||"Could not update evidence decision");}
    finally{setBusy(false);setConfirm(null);}
  }
  return <div className="space-y-3 rounded-lg border border-outline-variant p-3">
    <p className="font-label-md">Proof of findings ({all.filter(t=>!dropped(t)).length} retained)</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {all.map((token,index)=>{
        const excluded=dropped(token);
        const canReview=Boolean(stage && token.startsWith("evidence:") && !(stage==="coordinator" && status(token)?.leadDropped));
        const label=names[token]||`Evidence ${index+1}${index>=files.length?" · Lead":" · Auditor"}`;
        return <div key={token} className={`relative rounded-lg border border-outline-variant p-3 ${excluded?"opacity-60":""}`}>
          {canReview && <button type="button" title={excluded?"Restore evidence":"Drop evidence"} aria-label={excluded?"Restore evidence":"Drop evidence"} disabled={busy} onClick={e=>{e.stopPropagation();if(excluded)void decide(token,false);else setConfirm(token)}} className="absolute right-1 top-1 z-10 rounded-full p-1 text-error hover:bg-surface-container">{excluded?"↶":"×"}</button>}
          <div role="button" tabIndex={0} title="Double-click to preview" onDoubleClick={()=>void openFile(token)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();void openFile(token)}}} className="cursor-zoom-in select-none pr-5">
            <div className="text-2xl" aria-hidden="true">{token.endsWith(".pdf")?"▤":"▧"}</div>
            <p className="break-all text-xs">{label}</p>
            <p className="text-xs text-on-surface-variant">{excluded?"Excluded":"Double-click to preview"}</p>
          </div>
        </div>;
      })}
    </div>
    {canUpload && <label className="inline-block cursor-pointer rounded-lg border border-outline-variant px-3 py-2 text-sm">{busy?"Uploading...":"+ Add photo / PDF"}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f);e.target.value=""}} /></label>}
    {confirm && <div role="alertdialog" aria-label="Confirm evidence exclusion" className="rounded-lg border border-outline-variant p-3"><p className="mb-3 text-sm">Drop this evidence from the next review stage? The original upload will be preserved.</p><div className="flex gap-2"><button type="button" onClick={()=>setConfirm(null)} className="rounded border px-3 py-1">Cancel</button><button type="button" disabled={busy} onClick={()=>void decide(confirm,true)} className="rounded bg-error px-3 py-1 text-on-error">Confirm drop</button></div></div>}
    {preview && <div role="dialog" aria-label="Evidence preview" className="fixed inset-0 z-[100] flex flex-col bg-black/90 p-4"><div className="mb-3 flex justify-between text-white"><span>{preview.name}</span><button type="button" onClick={()=>setPreview(null)} aria-label="Close preview" className="px-3">×</button></div>{preview.type==="application/pdf"?<iframe title="PDF evidence" src={preview.url} className="h-full w-full bg-white"/>:<img src={preview.url} alt="Finding evidence" className="min-h-0 flex-1 object-contain"/>}</div>}
    {error && <p role="alert" className="text-sm text-error">{error}</p>}
  </div>;
}
