
<%*
const colors = ['orange','yellow','pink','blue','green'];
let color = await tp.system.suggester(colors,colors,false,'Color');
if (color !== null)
{
   tR = `<span class="fs12 ${color}">${tp.file.selection()}</span>`;
}
-%>