
export const bool = (v) => { return v==="false" || v==="null" || v==="NaN" || v==="undefined" || v==="0" ? false : !!v; }