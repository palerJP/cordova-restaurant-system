export function createReviewLongPress(open:()=>void) {
 let timer:ReturnType<typeof setTimeout>|undefined;
 let origin={x:0,y:0};
 const cancel=()=>{if(timer!==undefined)clearTimeout(timer);timer=undefined;};
 return {
  start(x:number,y:number,pointerType:string){cancel();if(pointerType==='mouse')return;origin={x,y};timer=setTimeout(()=>{timer=undefined;open();},600);},
  move(x:number,y:number){if(Math.hypot(x-origin.x,y-origin.y)>10)cancel();},
  cancel,
 };
}
