import {files,histories} from './mockData';
export async function getFileDetail(identifier:string){const file=files.find(x=>x.secureTrackingId===identifier||x.id===identifier||x.fileId===identifier);return file?{file,histories:histories.filter(x=>x.fileId===file.id)}:null}
