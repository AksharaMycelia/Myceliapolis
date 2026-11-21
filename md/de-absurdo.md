# De absurdo · The Twelve-Dollar Loop

$$
A=\mathrm{KFC},\qquad B=\text{पञ्चामृतम्},\qquad
\psi_A=\binom10,\quad\psi_B=\binom01.
$$

$$
\psi(t)=\cos\!\left(\frac{\pi t}{2}\right)\psi_A+
\sin\!\left(\frac{\pi t}{2}\right)\psi_B,\qquad 0\le t\le1.
$$

$$
d_{\mathrm{surf}}(s,t):=\arccos\bigl|\langle\psi(s),\psi(t)\rangle\bigr|
=\frac{\pi}{2}|s-t|.
$$

$$
X=[0,1],\qquad Y=X/(0\sim1),\qquad q:X\longrightarrow Y,
\qquad\boxed{d_{\mathrm{surf}}(0,1)=\frac{\pi}{2},\quad q(0)=q(1).}
$$

$$
\gamma(t)=q(t),\qquad Y\cong S^1,\qquad [\gamma]=1\in\mathbb Z\cong\pi_1(Y).
$$

$$
\gamma(0)=\gamma(1),\qquad\gamma\not\simeq\mathrm{const}.
$$

---

$$
D(s,t):=1-\bigl|\langle\psi(s),\psi(t)\rangle\bigr|^2,\qquad t_j=\frac jn.
$$

$$
D(0,1)=1,\qquad\max_{0\le j<n}D(t_j,t_{j+1})
=\sin^2\!\left(\frac{\pi}{2n}\right)\xrightarrow[n\to\infty]{}0,
\qquad[\gamma]=1\quad(\forall n\ge1).
$$

$$
U_A,U_B\overset{\mathrm{iid}}{\sim}\mathrm{Bernoulli}\!\left(\tfrac12\right),
\qquad E=U_A\oplus U_B.
$$

$$
I(U_A;U_B)=I(U_A;E)=I(U_B;E)=0,\qquad I(U_A;U_B\mid E)=1\ \mathrm{bit}.
$$

$$
\boxed{\Pr(U_B=1\mid E)=\tfrac12,\qquad\Pr(U_B=U_A\oplus E\mid U_A,E)=1.}
$$

---

$$
\widetilde Y_\varepsilon=
\bigl([0,1]\times\{-1,+1\}\bigr)\big/
\bigl((1,s)\sim(0,\varepsilon s)\bigr),\qquad\varepsilon\in\{-1,+1\}.
$$

$$
s_0=+1,\qquad s_n^{(\varepsilon)}=
\operatorname{Hol}_{\gamma^n}^{(\varepsilon)}(s_0)=\varepsilon^n.
$$

$$
\bigl(s_{2m}^{(+1)}\bigr)_{m\ge0}
=\bigl(s_{2m}^{(-1)}\bigr)_{m\ge0}
=(+1,+1,+1,\ldots).
$$

$$
\boxed{s_{2m+1}^{(+1)}=+1,\qquad s_{2m+1}^{(-1)}=-1.}
$$

---

$$
(x(t),y(t))=(\cos2\pi t,\sin2\pi t),\qquad
dz=\frac{x\,dy-y\,dx}{2\pi}\quad\text{along }\gamma.
$$

$$
(x(n),y(n))=(1,0),\qquad s_n^{(-1)}=(-1)^n,\qquad
z(n)-z(0)=\frac1{2\pi}\oint_{\gamma^n}(x\,dy-y\,dx)=n.
$$

$$
\begin{array}{c|ccc}
n&(x,y)&s&z-z(0)\\\hline
0&(1,0)&+1&0\\
1&(1,0)&-1&1\\
2&(1,0)&+1&2
\end{array}
$$

---

$$
\mathscr R=\{\textit{solemn},\textit{ridiculous}\},\qquad
h=(\textit{solemn}\ \ \textit{ridiculous}),\qquad
\operatorname{Fix}_{\mathscr R}(h)=\varnothing.
$$

$$
H=h\times\mathrm{id}_{\{\$12\}}\times\mathrm{id}_{\{\text{🐕}\}}.
$$

$$
\boxed{
\begin{aligned}
(\textit{solemn},\$12,\text{🐕})
&\xrightarrow{\ \gamma\ }(\textit{ridiculous},\$12,\text{🐕})\\
&\xrightarrow{\ \gamma\ }(\textit{solemn},\$12,\text{🐕}).
\end{aligned}}
$$

---
<!-- city:doors -->
You are in: **De absurdo · The Twelve-Dollar Loop** · `math/de-absurdo` · [as a page](/math/de-absurdo/)

Doors from here: [विपुलक्षेत्रव्रतम्](/md/vipulaksetra-vratam.md) ([as a page](/math/vipulaksetra-vratam/))

City map: [Plain text](/md/index.md) · [/atlas/](/atlas/#math-de-absurdo) · [every door as data](/manifest.json)
<!-- /city:doors -->
