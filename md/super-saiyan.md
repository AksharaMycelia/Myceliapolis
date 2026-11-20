# Super Saiyan

$$
\begin{gathered}
x=(a,b)^\top\in\mathbb C^2,\qquad 0<r<1,\quad s>0,\quad -\pi<\phi\le\pi,\\
W_{\mathrm{Wah}}=r\begin{pmatrix}1&s\\0&1\end{pmatrix},
\qquad U_{\mathrm{Waluigi},\phi}=r\begin{pmatrix}1&0\\se^{i\phi}&1\end{pmatrix},\\
W=W_{\mathrm{Wah}},\qquad U_\phi=U_{\mathrm{Waluigi},\phi},\qquad
\lim_{n\to\infty} W^n=\lim_{n\to\infty}U_\phi^n=0 .
\end{gathered}
$$

$$
\begin{gathered}
C_\phi=U_\phi W=r^2\begin{pmatrix}1&s\\se^{i\phi}&1+s^2e^{i\phi}\end{pmatrix},\\
r=\tfrac12,\quad s=\tfrac32,\quad\phi=0:\qquad
\binom12\xrightarrow{\,W\,}\binom21\xrightarrow{\,U_0\,}\binom12 .
\end{gathered}
$$

---

$$
\begin{gathered}
z=s^2e^{i\phi},\qquad D=z(z+4),\qquad
\lambda_\pm=\tfrac{r^2}{2}(2+z\pm\sqrt D),\qquad g_\phi=\max_\pm|\lambda_\pm|,\\
A=r^{-2}+r^2,\qquad B=r^{-2}-r^2,\\
g_\phi>1\iff
\frac{(2+s^2\cos\phi)^2}{A^2}+\frac{s^4\sin^2\phi}{B^2}>1 .
\end{gathered}
$$

$$
\begin{gathered}
r^{-1}-r<s<r^{-1}+r,\qquad
\phi_c=\arccos\!\left(\frac{B^2}{2s^2}-\frac A2\right),\\
g_\phi>1\iff|\phi|<\phi_c,\qquad
(r,s)=(\tfrac12,2)\implies\cos\phi_c=-\tfrac{47}{128}.
\end{gathered}
$$

$$
\begin{gathered}
E>0,\qquad F_C(x)=\frac{Cx}{\sqrt{1+\|Cx\|^2/E}},\qquad
F_C^n(x)=\frac{C^n x}{\sqrt{1+E^{-1}\sum_{j=1}^{n}\|C^j x\|^2}},\\
C v=g e^{i\omega}v,\quad \|v\|=1,\quad x=\sqrt{I_0}v,\quad I_0>0,\\
I_n=\|F_C^n(x)\|^2,\qquad I_n^{-1}=g^{-2n}I_0^{-1}+E^{-1}\sum_{j=0}^{n-1}g^{-2j},\\
g<1:\ I_n\to0,\qquad g=1:\ nI_n\to E,\qquad
g>1:\ I_n\to E(1-g^{-2}).
\end{gathered}
$$

---

$$
\begin{gathered}
h=\tfrac12(s+\sqrt{s^2+4}),\qquad
v_{\to}=\frac{(1,h)^\top}{\sqrt{1+h^2}},\qquad
v_{\leftarrow}=\frac{(h,1)^\top}{\sqrt{1+h^2}},\\
U_0Wv_{\to}=r^2h^2v_{\to},\qquad WU_0v_{\leftarrow}=r^2h^2v_{\leftarrow},\\
P(x)=xx^\dagger/\|x\|^2,\qquad P_{\to,\leftarrow}=P(v_{\to,\leftarrow}),\qquad
Z=\begin{pmatrix}-1&0\\0&1\end{pmatrix},\\
[U_0,W]=r^2s^2Z,\qquad
\operatorname{tr}(ZP_\to)=-\operatorname{tr}(ZP_\leftarrow)=\frac{s}{\sqrt{s^2+4}} .
\end{gathered}
$$

$$
\begin{gathered}
\mathcal G(P(x),P(y))=\arccos\frac{|x^\dagger y|}{\|x\|\|y\|},\qquad
\mathcal G(P_\to,P_\leftarrow)=\arctan(s/2),\\
\tfrac14[\operatorname{tr}(Z(P_\to-P_\leftarrow))]^2+
\operatorname{tr}(P_\to P_\leftarrow)=1 .
\end{gathered}
$$

---

$$
\begin{gathered}
s=2,\quad\phi=\pi,\quad\beta=-2\log r,\qquad
u=\tfrac1{\sqrt2}(1,-1)^\top,\quad v=\tfrac1{\sqrt2}(1,1)^\top,\\
N=4uv^\dagger,\qquad N^2=0,\qquad C_\pi=e^{-\beta}(-I+N),\\
C_\pi^n=(-1)^ne^{-\beta n}(I-nN),\qquad
\|C_\pi^n\|_2=e^{-\beta n}\left(\sqrt{1+4n^2}+2n\right),\\
\lim_{\beta\downarrow0}\beta\sup_{n\ge0}\|C_\pi^n\|_2=4/e,\qquad
\lim_{n\to\infty}C_\pi^n=0\quad(\beta>0).
\end{gathered}
$$

$$
\begin{gathered}
I_n(\beta,x)=\|F_{C_\pi}^{\,n}(x)\|^2,\qquad
x_{\beta,\xi}=u+\tfrac{\beta\xi}{4}v,\qquad \xi>0,\\
(-1)^ne^{\beta n}C_\pi^n x_{\beta,\xi}
=(1-\beta n\xi)u+\tfrac{\beta\xi}{4}v,\\
\lim_{\substack{\beta\downarrow0\\\beta n\to y}}
\frac{I_n(\beta,x_{\beta,\xi})}{E\beta}
=\frac{e^{-2y}(1-\xi y)^2}{\int_0^y e^{-2z}(1-\xi z)^2\,dz}
\quad(y>0).
\end{gathered}
$$

$$
\begin{gathered}
\beta_n=(n\xi)^{-1},\qquad
J_\xi=\int_0^{1/\xi}e^{-2z}(1-\xi z)^2\,dz,\\
\lim_{n\to\infty}\frac{I_n(\beta_n,x_{\beta_n,\xi})}{E\beta_n^3}
=\frac{\xi^2e^{-2/\xi}}{16J_\xi},\\
P(F_{C_\pi}^{\,n}(x_{\beta_n,\xi}))=vv^\dagger\quad(\beta=\beta_n),\qquad
P(x_{\beta_n,\xi})\longrightarrow uu^\dagger,\qquad
\mathcal G(uu^\dagger,vv^\dagger)=\frac{\pi}{2}.
\end{gathered}
$$

---

$$
\begin{gathered}
z(\vartheta)=-4+\epsilon e^{i\vartheta},\qquad
0<\epsilon<4,\quad s=\sqrt{|z|},\quad e^{i\phi}=z/|z|,\\
w_\pm=\frac{z\pm\sqrt{z(z+4)}}{2s},\qquad
R_\pm=\binom1{w_\pm},\qquad L_\pm^\top=(-w_\mp,1),\\
C_\phi R_\pm=\lambda_\pm R_\pm,\qquad
L_\pm^\top R_\pm=\pm\Delta,\qquad\Delta=w_+-w_- .
\end{gathered}
$$

$$
\begin{gathered}
q_\pm^2=(\pm\Delta)^{-1},\qquad q_-(0)=-i q_+(0),\qquad
\widehat R_\pm=q_\pm R_\pm,\quad\widehat L_\pm=q_\pm L_\pm,\\
(\sqrt{z(z+4)},q_+,q_-)\in C^0(\mathbb R;\mathbb C^3),\\
\mathsf R=(\widehat R_+,\widehat R_-),\qquad
M=\begin{pmatrix}0&-1\\1&0\end{pmatrix},\\
\mathsf R(2k\pi)=\mathsf R(0)M^k,\qquad M^2=-I,\quad M^4=I
\quad(k\in\mathbb Z).
\end{gathered}
$$

$$
\begin{gathered}
\mathcal A_+=\widehat L_+^\top d\widehat R_+
=\frac{s}{2\sqrt{z(z+4)}}\,d(z/s),\qquad \int_0^{4\pi}\mathcal A_+=0,\\
V(\vartheta)=\exp\!\left(-\int_0^\vartheta\mathcal A_+\right)\widehat R_+(\vartheta),\\
P(V(4\pi))=P(V(0)),\qquad
\frac{\|V(0)+V(4k\pi)\|^2}{4\|V(0)\|^2}=\cos^2(k\pi/2).
\end{gathered}
$$

$$
\begin{gathered}
x_k=M^ku,\qquad C_\star=-I+4uv^\dagger,\qquad k\in\mathbb Z,\\
\lim_{n\to\infty}P(F_{C_\star}^{\,n}(x_k))=uu^\dagger,\qquad
\boxed{\ \lim_{n\to\infty}\frac{n\|F_{C_\star}^{\,n}(x_k)\|^2}{E}=2-(-1)^k\ } .
\end{gathered}
$$

---
<!-- city:doors -->
You are in: **Super Saiyan** · `math/super-saiyan` · [as a page](/math/super-saiyan/)

Doors from here: [Akṣara](/md/aksara.md) ([as a page](/math/aksara/))

City map: [Plain text](/md/index.md) · [/atlas/](/atlas/#math-super-saiyan) · [every door as data](/manifest.json)
<!-- /city:doors -->
