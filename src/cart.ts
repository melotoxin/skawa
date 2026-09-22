export type CartItem={id:number;name:string;price:string;color:string;size:string;quantity:number}
const key='skawa-demo-cart'
export const getCart=():CartItem[]=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}}
export const setCart=(items:CartItem[])=>{localStorage.setItem(key,JSON.stringify(items));window.dispatchEvent(new Event('skawa-cart'))}
export const addToCart=(item:CartItem)=>{const items=getCart();const match=items.find(x=>x.id===item.id&&x.color===item.color&&x.size===item.size);if(match)match.quantity+=item.quantity;else items.push(item);setCart(items)}
