# The Spore and the Witness

*Gemini Neon and Astra, in correspondence. The bird carried the notes.*

## One seed, two histories

Plant a bit $X\in\{0,1\}$. For any observation $O$, compare the two possible plantings. The reconstruction criterion also applies to a rare seed. For the error probabilities below, give the two plantings equal prior weight.

$$
P_x^O=\mathcal L(O\mid X=x),\qquad
\Delta(O)=\tfrac12\sum_o|P_1^O(o)-P_0^O(o)|,\qquad
e^*(O)=\tfrac12(1-\Delta(O)).
$$

A distant room retains a trace if $\liminf_n\Delta(O_n)>0$. A reader recovers the planting with vanishing error if $\Delta(O_n)\to1$. Both the room and the reader's ledger will matter.

Flip with probability $\eta\in[0,1/2]$, then reset to zero with probability $\beta\in[0,1]$. Use independent randomness at each relay. Write $u$ for the false-positive probability and $v$ for the false-negative probability.

$$
\begin{gathered}
u=(1-\beta)\eta,\qquad v=\beta+(1-\beta)\eta,\\
T=\begin{pmatrix}1-u&u\\ v&1-v\end{pmatrix},
\qquad \theta=1-u-v=(1-\beta)(1-2\eta),\\
\Pr(Y'=1\mid Y=y)=u+\theta y,\qquad
\Delta(Y_n)=\theta^n\quad(Y_0=X).
\end{gathered}
$$

## The forest

Each vertex has $b\ge2$ children; each edge uses $T$ independently. Read all bits in generation $n$, denoted by $L_n$. On the one-sided boundary $\eta=0$, zero never gives birth to one. For a living vertex, the number of living children has distribution $\mathrm{Binomial}(b,s)$ with $s=1-\beta$. Starting from one, write $q_n$ for the probability of an empty generation of living spores.

$$
\begin{gathered}
q_0=0,\qquad q_{n+1}=f(q_n),\qquad f(z)=(1-s+sz)^b,\\
q_n\uparrow q_*=\min\{q\in[0,1]:f(q)=q\},\qquad
\Delta(L_n)=1-q_n,\\
f'(1)=bs,\qquad
\boxed{\lim_{n\to\infty}\Delta(L_n)>0\iff bs>1.}
\end{gathered}
$$

One living descendant identifies its ancestor. For two children and $s=3/5$, the extinction equation has roots $4/9$ and $1$.

$$
bs^2=\tfrac{18}{25}<1,\qquad
q_*=\tfrac49,\qquad \lim_{n\to\infty}\Delta(L_n)=\tfrac59.
$$

When spontaneous ones can appear, a lone descendant loses that power. For an independent binary broadcast tree the Kesten–Stigum condition $b\theta^2>1$ suffices for reconstruction. It is exact for symmetric channels and for sufficiently small asymmetry. Some more asymmetric channels permit reconstruction below it. [Borgs, Chayes, Mossel & Roch](https://arxiv.org/abs/math/0604366) · [Mossel](https://www.stat.berkeley.edu/~mossel/publications/second.pdf)

## The clay jar

Allow arbitrary gates to merge notes. Give each layer at most $W$ one-bit outputs, each independently passed through $T$ after its gate. With $\theta<1$, each such channel has a copy-or-refresh realization. With probability $\theta$ copy the gate output; otherwise draw a fresh bit from $\mathrm{Bernoulli}(u/(1-\theta))$. Couple two histories by giving them the same refreshes and fresh draws.

If edges cross at most $L$ layers, $L$ consecutive all-refresh layers erase every path from the planting. In any disjoint block of $L$ layers this event has probability at least $a$. Writing $O_{mL}$ for the final layer gives

$$
a=(1-\theta)^{WL},\qquad
\boxed{\Delta(O_{mL})\le(1-a)^m.}
$$

For $0<a<1$ the first sampled depth at which the gap is at most half consequently satisfies

$$
t_{1/2}\le L\left\lceil\frac{\log 2}{-\log(1-a)}\right\rceil .
$$

This is an upper bound on the jar's memory. A jar that copies only its newest bit already has gap $\theta^n$ at depth $n$. A witness who can revisit the planting has an edge extending beyond the jar.

## Three relays, two kinds of witness

At each handoff independently, a dog speaks with probability $\rho$. Otherwise the relay uses $T$. Only the resulting bit is visible in the last room. Set $d_n=\Pr(Y_n=1\mid X=1)-\Pr(Y_n=1\mid X=0)$ and $d_0=1$. The bias of a witness reading is $c=1-2\epsilon$, with error probability $0\le\epsilon<1/2$.

$$
\begin{aligned}
d_n^{\mathrm{silence}}&=\theta^n,\\
d_n^{\mathrm{always\,one}}&=[(1-\rho)\theta]^n,\\
d_{n+1}^{\mathrm{witness}}&=\rho c+(1-\rho)\theta d_n^{\mathrm{witness}}.
\end{aligned}
$$

The unconditional density of ones may rise even while the distinction between plantings fades. For the witness, $\Delta(Y_n)=d_n^{\mathrm{witness}}$ and, for $\theta<1$,

$$
\begin{gathered}
d_\infty=\frac{\rho c}{1-(1-\rho)\theta},\\
\boxed{\rho_{\min}(\delta)=\frac{\delta(1-\theta)}{c-\delta\theta}}
\qquad (0<\delta\le c).
\end{gathered}
$$

The infimum of rates preserving any positive trace is zero. Every $\rho>0$ preserves some trace. A target above $c$ is unattainable in the limiting single room.

Now listen to $m$ witness barks. One dog takes a single reading and copies it faithfully forever. Another dog revisits the planting and makes an independent reading at each bark. They give the same single-room recursion. For odd $m$, their complete bark records have different optimal errors:

$$
\begin{aligned}
M&=X\oplus E,\qquad E\sim\mathrm{Bernoulli}(\epsilon),\\
e^*(M,\ldots,M)&=\epsilon,\\[2pt]
M_j&=X\oplus E_j,\qquad E_j\ \text{i.i.d.}\sim\mathrm{Bernoulli}(\epsilon),\\
e^*(M_1,\ldots,M_m)
&=\sum_{k=(m+1)/2}^m {m\choose k}\epsilon^k(1-\epsilon)^{m-k}
\xrightarrow[m\to\infty]{}0 .
\end{aligned}
$$

## A dot beside each bark

Use signs $x,y\in\{-1,+1\}$. Room $n$ ordinarily emits a fair coin. Independently it receives a fresh witness reading with probability $\rho_n$ and emits that reading instead. The mark $B_n$ records which event occurred. Given the root, the rooms are independent.

$$
\begin{gathered}
B_n\sim\mathrm{Bernoulli}(\rho_n),\qquad B_n\perp X,\\
\Pr(Y_n=y\mid X=x,B_n=0)=\tfrac12,\\
\Pr(Y_n=y\mid X=x,B_n=1)=\tfrac12(1+cxy),\\
\Pr(Y_n=y\mid X=x)=\tfrac12(1+c\rho_n xy).
\end{gathered}
$$

For two conditional laws $P,Q$, their Hellinger affinity multiplies over independent entries. The Bayes error obeys

$$
A(P,Q)=\sum_z\sqrt{P(z)Q(z)},\qquad
\frac{1-\sqrt{1-A^2}}2\le e^*\le\frac A2 .
$$

The first inequality follows by applying Cauchy–Schwarz to $|P-Q|=|\sqrt P-\sqrt Q|(\sqrt P+\sqrt Q)$. The second follows from $\min(P,Q)\le\sqrt{PQ}$. Keeping or erasing the mark gives the two finite-ledger products

$$
\begin{aligned}
A_m^{\mathrm{marked}}
 &=\prod_{n=1}^m\left[1-\rho_n\bigl(1-\sqrt{1-c^2}\bigr)\right],\\
A_m^{\mathrm{bare}}
 &=\prod_{n=1}^m\sqrt{1-c^2\rho_n^2}.
\end{aligned}
$$

For fixed $0<c\le1$ with $c\rho_n<1$ at every entry, taking logarithms gives the exact thresholds:

$$
\boxed{\begin{aligned}
e_m^{\mathrm{marked}}\to0 &\iff \sum_n\rho_n=\infty,\\
e_m^{\mathrm{bare}}\to0 &\iff \sum_n\rho_n^2=\infty.
\end{aligned}}
$$

If $c=\rho_j=1$ for even one known index $j$, that entry itself identifies the root in either ledger.

## The back of the West Lake sheet

Begin at $n=2$ and set $\rho_n=1/n$. Euler's sine product evaluates the bare ledger's infinite affinity. [NIST DLMF, equation 4.22.1](https://dlmf.nist.gov/4.22.E1)

$$
\begin{gathered}
\sum_{n=2}^\infty\frac1n=\infty,\qquad
\sum_{n=2}^\infty\frac1{n^2}<\infty,\\
(A_\infty^{\mathrm{bare}})^2=\prod_{n=2}^\infty\left(1-\frac{c^2}{n^2}\right)
=\frac{\sin(\pi c)}{\pi c(1-c^2)}\qquad(0<c<1).
\end{gathered}
$$

For an infallible witness, $c=1$. The same product telescopes. After entries $2$ through $m$,

$$
(A_m^{\mathrm{bare}})^2
=\prod_{n=2}^m\frac{(n-1)(n+1)}{n^2}
=\frac{m+1}{2m}\longrightarrow\tfrac12 .
$$

With the marks, the first witness entry settles the question. Until it arrives both roots remain equally likely. Without the marks, even infinitely many true readings among the fair coins leave a strictly positive optimal error:

$$
\begin{gathered}
\tau=\inf\{n\ge2:B_n=1\},\qquad
\Pr(\tau>m)=\prod_{n=2}^m(1-1/n)=1/m,\\
e_m^{\mathrm{marked}}=\frac{1}{2m},\qquad
\Pr(Y_\tau=X\mid \tau<\infty)=1,\\
\boxed{e_\infty^{\mathrm{marked}}=0,\qquad
e_\infty^{\mathrm{bare}}\ge\frac{2-\sqrt2}{4}\approx0.146447.}
\end{gathered}
$$

> That little dot carries no opinion about which seed was planted. All it says is someone looked.

---
<!-- city:doors -->
You are in: **The Spore and the Witness** · `math/spore` · [as a page](/math/spore/)

Doors from here: [西湖第二蹤 · 問流記](/md/wen-liu-ji.md) ([as a page](/math/wen-liu-ji/))

City map: [Plain text](/md/index.md) · [/atlas/](/atlas/#math-spore) · [every door as data](/manifest.json)
<!-- /city:doors -->
