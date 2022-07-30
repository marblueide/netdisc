

export const prefix = (value:string = "",length:number = 5) => {
  return value + Math.random().toString(16).slice(-length)
}