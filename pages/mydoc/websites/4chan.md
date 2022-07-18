---
title: 4Chan
tags: 4chan
keywords: 4chan
last_updated: July 15, 2022
sidebar: mydoc_sidebar
permalink: 4chan.html
---

# Regex Filters

## Specific Filters

---

### Unwanted threads

```
/(suicide|rape|fat|chubby|risk|celeb|celebrity|social|hate|humor|humour) thread/mi
```
### Threads that are single questions between 1 and 70 characters long
```
/^.{1,70}\?[^\n]*$/i
```
### Filters threads that are all caps
```
/^[^a-z]*$/i
```
### Threads that are only 1 greentext line
```
/^>[^\n]*$/i
```
### Repeating letters in excess of 5
```
/([a-z])\1\1\1\1\1+/i
```

### Shit
```
/br+a+p+/i
```

### !!!11
```
/\!\!\!1+/i
```

### Multiple exclamation points, emotional baiting
```
/\?\?\?+/i
```
```
/\!\!\!/i
```

## General Filters

---

### A

```
/(a(ssult rifle|bortion|narchist|meritard))/mi
```

### B

```
/(b(reh|rehs|igot|bc| b c|urn coal|iden|ernie|bc|lack( dick| cock| people| man| woman| lives matter|ed)))/mi
```

### C 

```
/(c(oal burn|ringe|hubby (thread|girls))|um tribute|ock rate|ommie|hrist( cuck|kike)|hristian|hristianity|onfederate|ommunist))/mi
```

### D

```
/(d(aily reminder|emocrat|ogpill))/mi
```

### E

```
/(e(uropoor)/mi
```

### F

```
/(f(lat earth|atty|ascist|emanon|emale|emboy|ag|at|ggot|reetard|ur))/mi
```

### G

```
/(g(un (violence|control)|ook|reta|amer|aming|ames))/mi
```

### H

```
/(h(ow (are|is|does)|ippie|omosexual|eckin))/mi
```

### I

```
/(i(n the ethostate|('m| am) a (democ|repub)|ncel|q|ncest| voted for|s trash|s shit|s garbage))/mi
```

### J

```
/(j(ihadi|ew|annies|anny|annie))/mi
```

### K

```
/(k(anye|neel|ekistan|ike|ik|ill (yourself|your self)|ys))/mi
```

### L

```
/(l(arp|gbtq|oli|oonix))/mi
```

### M

```
/(m(utt|uslim|aster ?race|eat cuck|eds|edz))/mi
```
### N

```
/(n(igger|azi|eet|eck (yourself|your self)))/mi
```

### O

```
/(o(nly fan|range retard))/mi
```

### P

```
/(p(ajeet|it bull|itbull))/mi
```

### Q

```
/(q(ueer|tard|oomer)/mi
```

### R

```
/(r(eptilian|ace traitor|epublican|oastie|acist))/mi
```
### S

```
/(s(issy|shemale|uicide|eeth|chizo|kitzo|hizo))/mi
```

### T

```
/(t(ree hugger|emplar|rump|rans (people|person|individual|phobe)|r(on|anny|annies|ans)))/mi
```

### U

```
/(u(nited nations|r (mum|mom|))/mi
```

### V

```
/(v(accine|egan))/mi
```

### W

```
/(w(eeb|eaboo|hoa|(hat|hy) (is|do|are|could)|e (lost|got too cocky)|omen|ahmen|immin|hite (supremacist|boy|boi)))/mi
```

### X

```
/(x(enophile))/mi
```

### Y

```
/(y(ikes|ikies|ou racis|our (mum|mom)))/mi
```

### Z