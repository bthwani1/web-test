export default function slugify(name=""){
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^\p{Script=Arabic}a-z0-9\s-]/gu,"")
    .replace(/\s+/g,"-")
    .replace(/-+/g,"-");
}
