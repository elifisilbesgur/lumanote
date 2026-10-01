"""Original 64px object recipes for LumaNote 0.5.7. No external image assets."""
from pathlib import Path
import json, math, random
OUT=Path(__file__).resolve().parent/'ui/haven-art.js'
art={};A=[]
def R(x,y,w,h,c):
 if w>0 and h>0:A.append(['r',round(x),round(y),round(w),round(h),c])
def P(pts,c): A.append(['p',[[round(x),round(y)] for x,y in pts],c])
def E(x,y,rx,ry,c):
 for j in range(-round(ry),round(ry)+1):
  if abs(j)<=ry:
   q=rx*math.sqrt(max(0,1-(j/ry)**2));R(x-q,y+j,2*q+1,1,c)
def line(x1,y1,x2,y2,w,c):
 n=max(abs(x2-x1),abs(y2-y1),1)
 for i in range(int(n)+1):q=i/n;R(x1+(x2-x1)*q,y1+(y2-y1)*q,w,w,c)
wood='#795039';edge='#4a3932';light='#c89761';red='#b64b58';green='#477b59';cream='#eee5c8';gold='#eac273';blue='#75afb8';purple='#8c75ad'
def start(key):
 global A;A=[];art[key]=A
 R(9,60,46,2,'#27363128')
def star(x,y,c=gold):P([(x,y-6),(x+2,y-2),(x+6,y-2),(x+3,y+1),(x+4,y+5),(x,y+3),(x-4,y+5),(x-3,y+1),(x-6,y-2),(x-2,y-2)],c)
def ribbon(x,y,w,h):R(x+w*.43,y,3,h,cream);R(x,y+h*.4,w,3,cream);P([(x+w/2,y),(x+w/2-7,y-4),(x+w/2-7,y),(x+w/2+7,y),(x+w/2+7,y-4)],gold)
def gift(x,y,w=13,h=12,col=red):R(x,y,w,h,col);R(x,y,w,3,'#eb8c80' if col==red else '#88b198');ribbon(x,y,w,h)
def pumpkin(x,y,s=1,face=False):
 E(x,y,10*s,8*s,'#a35b31');E(x-3*s,y-1*s,5*s,7*s,'#d78440');E(x+3*s,y-1*s,5*s,7*s,'#e29c49');R(x-s,y-11*s,3*s,5*s,green)
 if face:P([(x-5*s,y-3*s),(x-s,y-3*s),(x-3*s,y-s)],edge);P([(x+2*s,y-3*s),(x+6*s,y-3*s),(x+4*s,y-s)],edge);R(x-3*s,y+2*s,7*s,2*s,'#693d2d');R(x-s,y+2*s,3*s,s,gold)
def leaf(x,y,c=green):E(x,y,3,2,c)
def wreath(x,y,r=13):
 for i in range(18):
  a=i*math.tau/18;xx=x+math.cos(a)*r;yy=y+math.sin(a)*r;E(xx,yy,4,4,green if i%2 else '#679466')
  if i%3==0:R(xx,yy,2,2,red)
 P([(x,y+r-3),(x-9,y+r-6),(x-7,y+r+2),(x,y+r)],red);P([(x,y+r-3),(x+9,y+r-6),(x+7,y+r+2),(x,y+r)],red)
def trunk(x,y,h=35):R(x-2,y-h,5,h,wood);R(x,y-h,1,h,light)
def fir(x,y,h=40,festive=False):
 trunk(x,y,14)
 for i in range(3):
  yy=y-h+i*h*.2;w=h*(.20+i*.12);P([(x,yy),(x+w,yy+h*.5),(x-w,yy+h*.5)],green if i%2 else '#37634f')
 if festive:
  star(x,y-h,gold)
  for i in range(8):R(x-10+(i*7)%19,y-h+15+i*3,2,3,[red,gold,'#e4cfe4'][i%3])
def bench(winter=False,autumn=False):
 R(11,28,42,5,light);R(11,36,42,5,wood);R(13,45,39,7,light);R(13,50,4,11,edge);R(47,50,4,11,edge);R(10,24,4,27,edge);R(51,24,3,28,edge)
 R(10,43,45,3,'#d2ab77')
 if winter:R(9,23,46,4,'#eff5e8');wreath(32,30,7)
 if autumn:pumpkin(14,52,.5);leaf(43,25,'#c0ad60');leaf(34,36,'#d2a967')
def arch(c=wood):
 R(7,17,5,44,c);R(52,17,5,44,c);P([(5,19),(10,8),(23,3),(42,3),(56,10),(60,19),(53,19),(49,13),(41,9),(23,9),(15,13),(12,20)],c)
def lantern(x=32,y=34,col=red):
 R(x-1,y-25,2,8,edge);P([(x-10,y-13),(x,y-20),(x+10,y-13)],edge);R(x-10,y-13,21,23,edge);R(x-7,y-10,15,17,gold);R(x-2,y-10,3,17,'#fff0ae');R(x-11,y+10,23,3,col);R(x-8,y+13,17,3,edge)
def house(ginger=False,spooky=False):
 col='#b58254' if ginger else '#69607b';R(12,24,40,34,col);P([(5,25),(31,5),(59,25)],red if ginger else '#4e415c');P([(5,25),(31,5),(59,25),(52,25),(31,12),(12,25)],cream if ginger else '#8d709a');R(29,41,11,17,edge)
 for x in [17,43]:R(x-3,31,9,10,edge);R(x-1,33,5,6,gold);R(x+1,33,1,6,cream)
 for y in [29,39,49]:R(12,y,40,1,'#71524445')
 if ginger:
  for x in [13,22,31,40,49]:R(x,27,3,3,[cream,green,red][x%3])
  R(43,8,6,10,red);R(42,7,8,3,cream)
 if spooky:pumpkin(13,54,.6,True);R(34,45,2,4,gold);R(43,6,5,15,edge)
def table(y=39):
 P([(7,y),(32,y-9),(57,y),(33,y+11)],light);P([(7,y),(33,y+11),(57,y),(57,y+5),(33,y+16),(7,y+5)],wood);R(11,y+5,4,18,edge);R(50,y+5,4,18,edge)
def plantpot(x,y,col='#729863',flowers=False):
 P([(x-8,y),(x+8,y),(x+6,y+12),(x-5,y+12)],'#b17850');R(x-9,y,19,3,'#d4a271');trunk(x,y,21)
 for i in range(5):leaf(x+(-1 if i%2 else 1)*(5+i%3),y-18+i*3,col)
 if flowers:
  for xx,yy in [(x-6,y-17),(x+6,y-14)]:E(xx,yy,3,3,'#e8a7c5');R(xx,yy,1,1,cream)
def shelf(potions=False):
 R(9,9,46,50,wood);R(13,12,38,43,edge)
 for y in [25,40,55]:R(11,y,42,4,light)
 if potions:
  for j,y in enumerate([24,39,54]):
   for i,x in enumerate([18,31,44]):
    R(x-4,y-6,8,6,['#8dad73','#bd8dd0','#8dcbc2'][(i+j)%3]);R(x-2,y-11,4,5,['#abd09c','#d2b4d9','#b3e1d2'][(i+j)%3]);R(x-2,y-12,4,2,wood);R(x-2,y-4,3,2,gold)
 else:
  for y in [22,39,54]:
   for x in [19,43]:plantpot(x,y-9,'#6f985e')
def sofa():
 R(12,22,41,23,'#afb786');R(15,25,35,17,'#c7ce9e');R(10,43,45,11,'#9ea77a');R(14,42,38,6,'#d3d4a4');R(7,34,8,22,wood);R(50,34,8,22,wood);R(9,34,6,4,light);R(50,34,7,4,light);R(12,55,4,7,edge);R(49,55,4,7,edge)
 for x in [18,35]:R(x,30,10,11,'#e6d6b6');R(x,30,10,2,'#f3e9c9')
def ghost(x=32,y=31):
 E(x,y-7,15,16,'#ebe7d8');P([(x-15,y-8),(x-15,y+21),(x-8,y+16),(x-2,y+21),(x+5,y+16),(x+15,y+21),(x+15,y-8)],'#ebe7d8');R(x-8,y-8,3,5,edge);R(x+6,y-8,3,5,edge);R(x-1,y+1,3,4,'#ab879e')
def cat():
 P([(17,29),(17,10),(29,23),(42,10),(46,30)],edge);E(31,34,15,16,'#454052');E(33,50,15,9,'#454052');R(22,31,4,3,gold);R(37,31,4,3,gold);R(30,38,3,2,'#d79599');line(46,51,55,43,4,edge);line(55,43,53,34,3,edge)
def bat(x,y,s=1):
 P([(x-2*s,y),(x-8*s,y-5*s),(x-15*s,y-3*s),(x-12*s,y+3*s),(x-6*s,y+1*s),(x,y+4*s),(x+6*s,y+1*s),(x+12*s,y+3*s),(x+15*s,y-3*s),(x+8*s,y-5*s),(x+2*s,y)],'#514054');R(x-2*s,y-3*s,4*s,7*s,edge)
# Winter collection: 24 individually recognizable models.
start('wnSnowman057');E(32,47,17,13,'#dce8df');E(32,29,12,11,'#eff4e8');R(23,9,18,10,edge);R(19,18,26,3,edge);R(22,37,21,5,red);R(38,39,4,13,red);R(26,28,2,2,edge);R(36,28,2,2,edge);P([(31,31),(42,33),(31,35)],'#d99d58');R(31,47,2,2,edge);R(31,53,2,2,edge);line(16,40,7,32,2,wood);line(47,41,58,33,2,wood)
start('wnSleigh057');R(7,49,48,6,wood);P([(8,33),(18,37),(51,36),(54,24),(58,24),(59,45),(52,51),(13,50)],red);R(14,48,3,10,gold);R(50,46,3,11,gold);R(8,58,50,3,gold);gift(18,21,16,17,green);gift(33,19,15,20);gift(29,8,14,13,'#668998')
start('wnGiftTower057');gift(9,42,25,18);gift(34,40,22,20,green);gift(19,24,28,18,'#708e99');gift(24,9,20,15,red)
start('wnWreath057');wreath(32,29,18);R(31,3,2,7,wood);P([(28,44),(22,60),(29,56),(31,61),(34,45)],red)
start('wnCandyArch057');arch(cream)
for x in [7,52]:
 for y in range(18,59,9):P([(x,y),(x+5,y-3),(x+5,y+2),(x,y+5)],red)
star(32,10);R(4,58,11,3,green);R(49,58,11,3,green)
start('wnSnowGlobe057');E(32,30,22,24,'#7eadb7');E(32,29,19,20,'#b9d1cd');R(16,50,32,7,wood);R(13,57,38,5,light);fir(32,47,26,True);R(15,24,2,14,'#eef6dc');R(47,28,2,12,'#deefd8')
start('wnNutcracker057');R(21,8,24,14,edge);R(23,8,20,3,red);R(25,22,16,12,'#d3ab80');R(27,25,2,2,edge);R(37,25,2,2,edge);R(25,30,16,2,cream);R(23,35,20,18,red);R(28,37,2,13,gold);R(36,37,2,13,gold);R(16,36,5,19,blue);R(45,36,5,19,blue);R(24,52,7,8,edge);R(35,52,7,8,edge);star(33,15)
start('wnReindeer057');E(29,41,19,9,'#ba8f57');R(42,25,9,16,'#ba8f57');E(48,24,8,7,'#c49f65');R(15,47,4,13,wood);R(38,47,4,13,wood);R(48,23,2,2,edge);R(53,26,3,3,red);line(45,19,41,6,2,gold);line(51,18,57,6,2,gold);line(42,11,36,9,2,gold);line(55,11,59,11,2,gold);R(44,31,10,3,red)
start('wnToyTrain057');R(5,40,23,13,red);R(8,26,15,18,green);R(9,24,16,3,edge);R(17,27,6,8,cream);R(29,42,27,11,green);R(28,38,30,4,light);gift(35,29,11,12);gift(46,33,9,9,'#7289a5')
for x in [12,23,36,50]:E(x,55,4,4,edge);E(x,55,2,2,gold)
start('wnGingerHouse057');house(ginger=True)
start('wnGiftCart057');table(42);E(17,58,5,5,edge);E(48,58,5,5,edge);gift(15,24,15,19,green);gift(31,18,17,23);line(52,42,58,26,3,wood)
start('wnWinterBench057');bench(winter=True)
start('wnStringLights057');R(7,18,3,43,wood);R(54,18,3,43,wood);line(8,18,31,24,1,edge);line(31,24,55,18,1,edge)
for x in [15,26,38,49]:line(x,22,x,31,1,wood);star(x,35)
start('wnFestiveFence057')
for x in range(8,57,10):R(x,27,4,31,wood);P([(x-1,27),(x+2,22),(x+5,27)],light)
R(8,34,49,4,light);R(8,48,49,4,light)
for x in [13,24,36,47]:leaf(x,35);R(x,37,2,3,red)
R(8,26,49,2,cream)
start('wnPostbox057');R(29,36,5,25,wood);R(12,18,39,24,red);R(14,20,35,3,'#df9c92');R(18,26,26,3,edge);R(50,12,3,17,wood);R(43,11,10,7,gold);R(9,16,46,3,cream);R(16,35,10,3,gold)
start('wnCocoaStand057');R(9,31,45,27,wood);R(8,35,47,5,light);R(11,14,3,30,wood);R(51,14,3,30,wood);P([(5,15),(15,5),(48,5),(59,15)],red);R(5,15,54,4,cream);R(12,47,38,8,green)
for x in [17,30,43]:R(x,28,7,8,cream);R(x+7,29,3,4,gold);line(x+2,26,x+3,21,1,'#e7e6cf')
start('wnLantern057');lantern();R(22,20,20,3,cream);R(18,48,28,3,cream);wreath(32,52,5)
start('wnStar057');R(30,22,4,36,wood);star(32,24);R(29,10,6,4,cream);R(22,58,22,3,gold)
start('wnSkatePond057');E(32,39,28,18,'#d5e6da');E(32,37,24,13,'#80b4c1');line(18,32,32,40,2,'#c0e8e2');line(24,27,45,39,1,'#d5e9dd');gift(7,44,10,11);fir(50,38,27,True)
start('wnCarolPiano057');R(13,17,39,35,green);R(14,17,36,3,gold);R(9,41,46,10,wood);R(12,40,40,5,cream)
for x in range(16,49,5):R(x,40,2,4,edge)
R(13,50,4,11,edge);R(48,50,4,11,edge);wreath(32,29,7)
start('wnMittens057');P([(12,17),(23,15),(28,27),(29,42),(15,46),(9,34)],red);P([(37,16),(49,19),(54,36),(46,46),(34,42),(34,28)],green);R(12,38,17,5,cream);R(34,38,17,5,cream);star(19,28);star(43,28);line(21,15,39,16,1,wood)
start('wnStockings057');R(8,14,48,4,wood)
for i,x in enumerate([13,30,47]):R(x-4,19,10,19,red if i%2 else green);R(x-4,18,11,4,cream);E(x,40,7,5,red if i%2 else green);R(x-2,29,4,3,gold)
start('wnCandleRing057');wreath(32,43,14)
for x,y in [(22,33),(33,25),(42,36)]:R(x-3,y,6,18,cream);P([(x-2,y-2),(x,y-8),(x+3,y-2)],gold)
start('wnPenguin057');E(32,39,16,22,edge);E(32,41,11,17,cream);R(24,22,3,3,edge);R(37,22,3,3,edge);P([(30,28),(37,28),(32,32)],gold);R(17,35,29,5,red);R(38,37,5,13,red);R(17,57,13,4,gold);R(35,57,13,4,gold)
# Halloween collection.
start('hwPumpkinArch057');arch(wood);pumpkin(13,47,.9,True);pumpkin(52,47,.9,True);pumpkin(32,12,.9,True);leaf(21,13,'#9b9b59');leaf(46,17,'#bf9352')
start('hwGhost057');ghost()
start('hwCauldron057');E(32,45,22,14,edge);E(32,32,22,7,purple);E(32,30,17,5,'#8eaf65');R(15,51,5,10,edge);R(44,51,5,10,edge);R(9,35,4,8,wood);R(51,35,4,8,wood);E(25,29,4,2,'#c6da84');E(37,26,3,3,'#b9d57b')
start('hwWitchHat057');E(32,49,25,8,edge);P([(14,47),(26,9),(43,5),(38,16),(45,48)],'#6c587f');R(18,39,25,6,red);R(27,39,7,7,gold);R(29,41,3,3,edge);star(31,29)
start('hwBroom057');line(43,7,22,46,4,wood);P([(18,36),(29,43),(25,59),(7,53)],'#c39a57')
for i in range(5):line(18+i*2,40,9+i*4,55,1,'#826443')
R(18,38,10,3,red)
start('hwBatTree057');trunk(31,61,46)
for x,y in [(11,14),(48,13),(12,32),(53,33)]:line(32,43,x,y,3,wood);leaf(x,y,'#ad8255')
bat(19,24,.6);bat(47,20,.7);pumpkin(38,55,.7,True)
start('hwSpookyHouse057');house(spooky=True);ghost(18,34);# small ghost cropped by architectural foreground effect
start('hwBlackCat057');cat()
start('hwCandyBowl057');E(32,34,22,7,'#a58baf');P([(10,34),(17,53),(46,53),(54,34)],'#6c5b81');R(18,48,27,3,'#9c80a5')
for i in range(13):x=17+i*7%31;y=28+i*3%10;R(x,y,5,3,[red,gold,'#a0ba7c'][i%3]);R(x-1,y+1,1,1,cream)
start('hwLantern057');R(30,8,3,48,wood);R(21,6,20,3,edge);line(23,7,15,20,1,edge);pumpkin(18,31,1.1,True);R(25,56,16,4,wood)
start('hwScarecrow057');R(30,21,3,40,wood);R(8,31,47,4,wood);R(22,32,20,18,red);R(25,35,2,12,gold);R(37,35,2,12,gold);E(32,22,10,8,'#bd975e');P([(18,15),(27,5),(39,7),(44,15)],wood);R(16,15,32,3,light);R(27,21,2,2,edge);R(36,21,2,2,edge);R(28,26,9,1,edge)
start('hwWebFence057')
for x in range(9,58,9):R(x,23,3,36,'#605469');P([(x-1,23),(x+1,16),(x+4,23)],'#95849b')
R(8,34,49,3,edge);R(8,49,49,3,edge)
for ex,ey in [(8,21),(32,18),(52,21),(10,49),(53,50)]:line(31,34,ex,ey,1,'#d2c9c577')
E(31,34,9,6,'#d2c9c54a')
start('hwRaven057');R(11,48,46,4,wood);R(43,45,4,17,wood);E(29,32,14,13,edge);E(40,21,7,7,'#554963');P([(45,21),(54,25),(45,25)],gold);P([(19,35),(9,44),(26,40)],edge);R(22,43,2,7,gold);R(34,43,2,7,gold);R(41,20,2,2,cream)
start('hwHayBale057');R(8,36,47,23,'#b89957')
for y in range(39,58,4):R(10,y,44,1,'#ddc381')
R(17,36,3,23,wood);R(45,36,3,23,wood);pumpkin(20,29,.8);pumpkin(42,27,1,True)
start('hwMushrooms057')
for x,y,s in [(19,43,1),(41,37,1.2),(35,54,.6)]:R(x-2,y,5,15,'#ddc5bd');E(x,y,11*s,6*s,'#8a629e');R(x-5,y-2,3,2,'#d4b2d7');R(x+4,y,3,2,gold)
start('hwPotionShelf057');shelf(True)
start('hwMoonGate057');arch('#635166');E(32,14,10,10,gold);E(37,11,8,8,'#635166');bat(12,35,.45);bat(52,29,.45);star(17,54,'#b49b65')
start('hwGrave057');E(32,22,18,14,'#797982');R(14,21,37,34,'#797982');R(17,26,31,26,'#a3a69c');R(29,30,6,4,edge);R(25,34,14,3,edge);R(30,37,4,9,edge);R(9,55,47,5,'#66676d');pumpkin(47,54,.5,True)
start('hwBatGarland057');R(6,9,3,51,wood);R(55,9,3,51,wood);line(7,10,32,16,1,edge);line(32,16,56,10,1,edge)
for x,y,s in [(18,29,.7),(42,26,.7),(31,48,.6)]:line(x,13,x,y,1,wood);bat(x,y,s)
start('hwCoffinPlanter057');P([(23,13),(43,13),(54,28),(46,57),(17,57),(9,29)],edge);P([(24,17),(41,17),(49,29),(43,53),(20,53),(14,30)],'#8e6c6b');plantpot(31,35,'#73965d',True);leaf(18,44,'#bd7c9c');leaf(43,38,purple)
start('hwPumpkinCart057');table(43);E(16,57,6,6,edge);E(48,57,6,6,edge);pumpkin(21,32,.9,True);pumpkin(41,29,1.1);line(53,43,59,26,3,wood)
start('hwAutumnBench057');bench(autumn=True)
start('hwSpider057');R(9,8,3,50,wood);R(9,8,44,3,wood)
for ex,ey in [(12,12),(52,12),(12,48),(53,49)]:line(33,30,ex,ey,1,'#c7c6b9')
for r in [7,14]:
 for i in range(8):a=i*math.tau/8;b=(i+1)*math.tau/8;line(33+math.cos(a)*r,30+math.sin(a)*r,33+math.cos(b)*r,30+math.sin(b)*r,1,'#c7c6b9')
E(33,34,5,7,edge)
for y in [30,35,40]:line(29,y,22,y+4,1,edge);line(37,y,44,y+4,1,edge)
start('hwSpellBook057');table(44);P([(15,32),(28,28),(33,31),(45,27),(51,31),(49,43),(32,47),(13,43)],cream);R(31,32,2,14,wood)
for y in [34,38,42]:R(18,y,10,1,'#927f62');R(37,y-2,9,1,'#927f62')
star(33,17,purple)
# Greenhouse and kitchen/bath furniture.
start('ghShelf057');shelf()
start('ghHanging057');line(19,32,32,5,1,wood);line(45,32,32,5,1,wood);plantpot(32,33,'#6b965a');
for i in range(7):leaf(18+i%2*3,36+i*3,'#56865b');leaf(45-i%2*3,37+i*3,'#82a565')
start('ghChair057');sofa();R(18,25,28,17,'#afb786');R(22,28,19,12,'#cbd1aa');R(24,44,15,3,cream)
start('ghSofa057');sofa();R(32,26,1,17,'#8c986d');R(21,52,25,1,'#667253')
start('ghPotting057');table(39);plantpot(19,26,'#799859');plantpot(43,24,'#527c59');R(30,30,7,5,'#725a3b');R(32,17,2,14,edge);R(30,14,6,4,light);R(19,53,26,4,wood)
start('ghSeedCabinet057');R(10,10,45,49,wood);R(12,10,42,4,light)
for j in range(3):
 for i in range(3):x=14+i*13;y=17+j*13;R(x,y,11,10,'#be9864');R(x+3,y+4,5,2,cream);R(x+5,y+5,1,1,edge)
R(12,58,4,4,edge);R(49,58,4,4,edge)
start('ghTerrarium057');P([(15,26),(31,11),(49,26),(49,51),(15,51)],'#8cbdad');R(19,44,26,7,'#688464');plantpot(31,37,'#64865c');P([(15,26),(31,11),(49,26),(47,27),(31,15),(18,27)],gold);R(15,26,2,26,gold);R(47,26,2,26,gold);R(16,50,33,3,gold);R(31,15,1,32,'#e6e1b3')
start('ghOrchid057');plantpot(32,46,'#578753');line(31,43,33,15,2,green)
for x,y in [(23,22),(40,16),(24,35),(39,29)]:E(x,y,6,4,'#e1afd2');E(x,y,3,2,'#f4d6e7');R(x,y,2,2,gold)
start('ghCitrus057');plantpot(32,47);E(31,27,19,20,'#487f50');E(27,23,14,16,'#719e5d');E(38,24,10,12,'#82aa61')
for x,y in [(21,19),(37,15),(42,32),(25,37)]:E(x,y,3,4,'#eed269');R(x,y-2,1,2,'#fff0a2')
start('ghBasket057');P([(10,33),(55,33),(50,58),(15,58)],'#b99562');E(32,27,20,15,wood);E(32,28,17,12,'#00000000');R(12,31,42,4,'#d9b983')
for y in range(38,57,4):R(15,y,35,1,'#e1bb7b')
R(17,24,9,16,'#799999');R(27,21,8,18,cream);R(36,26,9,14,red)
start('htDining057');table(30)
for x,y in [(20,28),(43,27)]:E(x,y,7,4,cream);E(x,y,4,2,gold)
R(29,15,5,14,blue);leaf(32,13);R(3,44,11,7,wood);R(52,44,10,7,wood);R(3,35,3,25,wood);R(58,35,3,25,wood)
start('htFridge057');R(18,6,31,54,'#547971');R(20,7,27,51,'#9ebaa6');R(23,10,21,15,'#bdd1b9');R(20,26,27,2,edge);R(23,29,21,27,'#a9c4ae');R(23,14,2,8,cream);R(23,34,2,13,cream);R(21,59,4,3,edge);R(42,59,4,3,edge);R(37,33,5,6,'#d1b479')
start('htSink057');R(8,31,48,29,'#8aab9e');R(6,28,52,7,cream);E(31,30,16,5,'#668b8f');E(31,31,12,3,'#adcacc');line(34,27,34,13,2,'#b9c8bd');line(34,13,25,13,2,'#e7e7cb');R(25,14,2,5,'#b9c8bd');R(31,38,1,20,'#54796c');R(25,42,2,5,gold);R(36,42,2,5,gold)
start('htStove057');R(10,23,44,36,'#c6cfbf');R(12,41,40,15,edge);R(15,44,34,10,'#5d7180');R(15,36,34,3,wood);R(10,23,44,9,'#e0e4cb')
for x in [20,44]:E(x,26,5,2,edge);E(x,19,4,2,edge)
for x in [17,28,39,48]:E(x,35,1,1,edge)
start('htCabinet057');R(9,12,46,48,wood);R(11,14,42,42,'#bca077');R(32,14,2,42,'#70563f');R(16,21,11,26,'#b9c9b8');R(39,21,10,26,'#b9c9b8');R(28,33,2,7,gold);R(36,33,2,7,gold);R(7,10,51,4,light)
start('htBath057');E(32,35,27,9,'#dee3cf');P([(7,33),(11,52),(19,56),(47,56),(55,50),(59,33)],'#c7d0c7');E(32,34,23,6,'#90bdc0');R(14,54,4,7,wood);R(47,54,4,7,wood);line(48,29,48,17,2,gold);line(48,17,40,17,2,gold);R(12,40,4,10,'#eff1db')
start('htToilet057');R(22,11,25,23,'#cfdccd');R(20,9,29,4,cream);R(25,29,17,9,'#b3c5c0');E(32,37,16,9,cream);E(32,35,11,5,'#8aabb0');P([(20,39),(23,57),(40,57),(45,40)],'#d7e0d1');R(23,57,20,3,'#c0d0c4');R(41,17,3,2,wood)
start('htVanity057');R(15,6,34,26,wood);R(18,9,28,20,'#b0d0cb');line(20,24,39,10,2,'#e4eee0');R(9,34,46,25,'#8eaf9e');R(7,32,50,6,cream);E(32,34,14,4,'#80a4a5');R(32,27,2,7,gold);R(11,49,42,2,'#679382');R(28,41,8,2,gold)
start('htShower057');P([(12,19),(42,7),(54,17),(54,56),(23,61),(12,52)],'#9cc8c477');P([(12,19),(42,7),(54,17),(23,28)],'#d1d9bc');R(12,19,2,33,wood);R(23,28,2,33,wood);R(53,17,2,40,wood);line(24,29,54,18,1,gold);R(40,15,2,15,edge);R(32,25,10,3,edge);R(32,29,1,9,'#e5f2db');R(35,29,1,9,'#e5f2db');R(37,39,2,7,gold)
start('htTowels057');R(14,8,4,53,wood);R(48,8,4,53,wood)
for y in [17,32,47]:R(16,y,35,3,light)
for x,y,col in [(20,19,'#a6beb0'),(24,34,'#e5d9bb')]:R(x,y,22,18,col);R(x,y+14,22,2,'#819d91');R(x+5,y,1,18,'#ffffff29')
OUT.write_text('/* Original geometry recipes; no uploaded image pixels or font assets. */\nObject.assign(DECOR_ART054,'+json.dumps(art,separators=(',',':'))+');\n')
print('Generated',len(art),'unique original models',sum(len(x) for x in art.values()),'drawing operations')
