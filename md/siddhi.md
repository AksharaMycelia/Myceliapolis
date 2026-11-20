# I Am the Vast Field · Siddhi

## I. Acquisition {#acquisition}

$$
\begin{gathered}
\mathcal H=\mathbb R^N,\quad N\ge2,\quad
\langle e_i,e_j\rangle=\delta_{ij},\qquad
v=N^{-1/2}\sum_{j=1}^N e_j,\qquad K/\sqrt N<\omega<K,\\
\mathsf I_A=\sum_{j\in A}e_je_j^\top,\qquad
j\in A\implies \mathsf I_{\{j\}}\preceq\mathsf I_A\preceq I_{\mathcal H},\\
\mathsf I_{\{j\}}v=e_j/\sqrt N,\qquad I_{\mathcal H}v=v .
\end{gathered}
$$

$$
\begin{gathered}
P=P^\top=P^2\ne0,\qquad
\mathcal U(P)=\{w:Pw=w,\ \|w\|=1\},\qquad
\kappa(w)=K|\langle v,w\rangle|,\\
\sup_{w\in\mathcal U(P)}\kappa(w)=K\|Pv\|,\qquad
w_A=\frac{\mathsf I_Av}{\|\mathsf I_Av\|}
=\frac1{\sqrt{|A|}}\sum_{j\in A}e_j \quad (A\ne\varnothing),\\
\boxed{\|e_j\|=\|w_A\|=\|v\|=1,\qquad
\kappa(w_A)=K\sqrt{|A|/N},\qquad
\kappa(v)/\kappa(e_j)=\sqrt N.}
\end{gathered}
$$

$$
\begin{gathered}
\omega_1-\omega_2=\omega,\qquad
\delta=\phi_1-\phi_2,\qquad
\dot\phi_1=\omega_1-\tfrac{\kappa}{2}\sin\delta,\quad
\dot\phi_2=\omega_2+\tfrac{\kappa}{2}\sin\delta,\\
\dot\delta=v_\kappa(\delta):=\omega-\kappa\sin\delta,\qquad \delta(0)=0,\\
\mathcal S_0(\kappa)=\lim_{T\to\infty}T^{-1}\int_0^T\cos\delta(t)\,dt,\qquad
\Omega_0(\kappa)=\lim_{T\to\infty}\delta(T)/T,\\
(\mathcal S_0,\Omega_0)=\begin{cases}
(0,\sqrt{\omega^2-\kappa^2}),&0\le\kappa<\omega,\\
(0,0),&\kappa=\omega,\\
(\sqrt{1-\omega^2/\kappa^2},0),&\kappa>\omega .
\end{cases}
\end{gathered}
$$

$$
\begin{gathered}
A_1\subset\cdots\subset A_N,\qquad |A_m|=m,\qquad
\kappa_m=\kappa(w_{A_m}),\qquad
m_*=\left\lfloor N\omega^2/K^2\right\rfloor+1,\\
\kappa_1<\cdots<\kappa_{m_*},\qquad
\mathcal S_0(\kappa_1)=\cdots=\mathcal S_0(\kappa_{m_*-1})=0
<\mathcal S_0(\kappa_{m_*}),\\
N=100,\quad\omega=4K/5
\implies
m_*=65,\quad \kappa_{64}=\omega,\quad\mathcal S_0(\kappa_{65})=1/\sqrt{65}.
\end{gathered}
$$

$$
\begin{gathered}
\Theta=\arccos N^{-1/2},\qquad
v_\perp=\frac{v-\cos\Theta\,e_1}{\sin\Theta},\qquad
w(\vartheta)=\cos\vartheta\,e_1+\sin\vartheta\,v_\perp,\\
w(0)=e_1,\quad w(\Theta)=v,\quad
\langle v,w(\vartheta)\rangle=\cos(\Theta-\vartheta),\\
b(t)\in[0,1],\quad\lambda>0,\qquad
\dot\vartheta=\lambda b(t)(\Theta-\vartheta),\quad\vartheta(0)=0,\\
B(t)=\int_0^t b(s)\,ds,\qquad
\vartheta(t)=\Theta(1-e^{-\lambda B(t)}),\\
\vartheta_*=\Theta-\arccos(\omega/K),\qquad
B_*=\lambda^{-1}\log\frac{\Theta}{\arccos(\omega/K)},\\
\boxed{\mathcal S_0(\kappa(w(\vartheta(t))))>0
\iff\vartheta(t)>\vartheta_*\iff B(t)>B_* .}
\end{gathered}
$$

$$
\begin{gathered}
P=I_{\mathcal H},\quad Q=vv^\top,\qquad
\operatorname{rank}P=N,\quad \operatorname{rank}Q=1,\\
Pv=Qv=v,\qquad
\mathcal S_0(\kappa(Pv))=\mathcal S_0(\kappa(Qv))>0,\qquad
0\ne z\perp v\implies Pz=z,\ Qz=0 .
\end{gathered}
$$

## II. Loss of faith {#loss}

$$
\begin{gathered}
c_r(b)=r+(1-r)b,\qquad 0\le r,s\le1,\quad u\ge0,\quad u_0>0,\\
\psi=c_r(b)\vartheta,\qquad
\boxed{\kappa(\vartheta,b,u;r,s)
=\frac{Kc_s(b)}{1+u/u_0}\cos(\Theta-c_r(b)\vartheta)},\\
b=1,\quad u=0\implies \kappa=K\cos(\Theta-\vartheta)
\qquad(\forall r,s).
\end{gathered}
$$

$$
\begin{gathered}
b(t)=\mathbf1_{\{t<T\}},\quad T>B_*,\quad u=0,\qquad
\vartheta_T=\Theta(1-e^{-\lambda T})>\vartheta_*,\\
\vartheta(T^-)=\vartheta(T^+)=\vartheta_T,\qquad
\kappa(T^-)=K\cos(\Theta-\vartheta_T)>\omega,\\
\kappa(T^+)=Ks\cos(\Theta-r\vartheta_T),\\
\boxed{\mathcal S_0(\kappa(T^+))>0
\iff s\cos(\Theta-r\vartheta_T)>\omega/K.}
\end{gathered}
$$

$$
\begin{aligned}
(r,s)=(1,1):\quad&\kappa(T^+)=\kappa(T^-),\\
(r,s)=(0,1):\quad&\kappa(T^+)=K/\sqrt N<\omega,\\
s=0:\quad&\kappa(T^+)=0,\\
s=1:\quad&\mathcal S_0(\kappa(T^+))>0\iff r>\vartheta_*/\vartheta_T .
\end{aligned}
$$

$$
\begin{gathered}
\vartheta=\Theta,\qquad (r,s)=(1,0),\qquad \kappa(b,u)=Kb/(1+u/u_0),\\
h(u)=\frac\omega K(1+u/u_0),\quad
\mathcal S(b,u)=\mathcal S_0(\kappa(b,u)),\qquad
\mathcal S(b,u)>0\iff b>h(u),\\
u_*=u_0(K/\omega-1),\qquad
u\ge u_*\implies \mathcal S(1,u)=0,\qquad
\lim_{u\uparrow u_*}\frac{\mathcal S(1,u)}{\sqrt{u_*-u}}
=\sqrt{\frac{2\omega}{Ku_0}} .
\end{gathered}
$$

$$
\begin{gathered}
\tau_b\dot b=\alpha\mathcal S(b,u)-\gamma b,\quad
\alpha,\gamma,\tau_b>0,\quad a=\alpha/\gamma,\quad 0<2h(u)<a\le1,\\
\rho=2h(u)/a,\qquad b_\pm=\frac a{\sqrt2}\sqrt{1\pm\sqrt{1-\rho^2}},
\qquad h(u)<b_-<b_+<1,\\
b(0)=b_+,\quad
u(t)=\begin{cases}U,&0\le t<T,\\u,&t\ge T,\end{cases}
\qquad h(U)\ge1,\qquad b(T)=b_+e^{-\gamma T/\tau_b},\\
T_*=\frac{\tau_b}{\gamma}\log\frac{b_+}{b_-}
=\frac{\tau_b}{\gamma}\operatorname{arcosh}(1/\rho),\\
\boxed{\lim_{t\to\infty}b(t)=\begin{cases}
b_+,&T<T_*,\\ b_-,&T=T_*,\\0,&T>T_* .
\end{cases}}
\end{gathered}
$$

## III. The trace {#trace}

$$
\begin{gathered}
\varepsilon>0,\qquad A_\kappa(T)=\varepsilon\int_0^T\cos\delta(t)\,dt,\qquad
\frac{d}{dt}\log v_\kappa(\delta(t))=-\kappa\cos\delta(t),\\
A_\kappa(T)=\frac{\varepsilon}{\kappa}\log\frac{\omega}{\omega-\kappa\sin\delta(T)}
\quad(\kappa>0),\qquad
\lim_{T\to\infty}\frac{A_\kappa(T)}{T}=\varepsilon\mathcal S_0(\kappa).
\end{gathered}
$$

$$
\begin{aligned}
0<\kappa<\omega:\quad
&T_\kappa=\frac{2\pi}{\sqrt{\omega^2-\kappa^2}},\qquad A_\kappa(nT_\kappa)=0,\\
&\sup_{T\ge0}A_\kappa(T)=\frac{\varepsilon}{\kappa}\log\frac{\omega}{\omega-\kappa};\\
\kappa=\omega:\quad
&\tan(\pi/4+\delta(t)/2)=1+\omega t,\\
&A_\omega(T)=\frac{\varepsilon}{\omega}\log\frac{1+(1+\omega T)^2}{2};\\
\kappa>\omega:\quad
&A_\kappa(T)=\varepsilon\sqrt{1-\omega^2/\kappa^2}\,T+O(1).
\end{aligned}
$$

$$
\boxed{\mathcal S_0(\omega)=\Omega_0(\omega)=0,\qquad
\lim_{T\to\infty}\frac{A_\omega(T)}{\log(1+\omega T)}=\frac{2\varepsilon}{\omega}.}
$$

## IV. Noise and recovery {#recovery}

$$
\begin{gathered}
D>0,\quad d\delta_t=v_\kappa(\delta_t)\,dt+\sqrt{2D}\,dW_t,\qquad
V(z)=-\omega z-\kappa\cos z,\\
p_\kappa(z)=Z_D^{-1}e^{-V(z)/D}\int_z^{z+2\pi}e^{V(y)/D}\,dy,\qquad
\int_0^{2\pi}p_\kappa(z)\,dz=1,\\
J_D=v_\kappa p_\kappa-Dp_\kappa',\quad
\Omega_D=2\pi J_D,\qquad \mathcal S_D=\int_0^{2\pi}\cos z\,p_\kappa(z)\,dz,\\
Z_D(\kappa)=2\pi\int_0^{2\pi}e^{-\omega s/D}I_0\!\left(\frac{2\kappa}{D}\sin\frac s2\right)ds,\\
\Omega_D=\frac{2\pi D(1-e^{-2\pi\omega/D})}{Z_D(\kappa)},\qquad
\mathcal S_D=\tfrac D2\partial_\kappa\log Z_D,\qquad
\kappa\mathcal S_D=D\int_0^{2\pi}\frac{(p_\kappa')^2}{p_\kappa}\,dz,\\
\kappa>0\implies\mathcal S_D\Omega_D>0 .
\end{gathered}
$$

$$
\begin{gathered}
C=K/(1+u/u_0),\quad \tau_b\dot b=\alpha\mathcal S_D(Cb)-\gamma b,\quad
\mathcal S_D'(0)=\frac{D}{2(\omega^2+D^2)},\\
\tau_b\dot b=\left[\frac{\alpha C D}{2(\omega^2+D^2)}-\gamma\right]b+O(b^3),\\
\alpha C>4\gamma\omega,\qquad D_\pm=\frac{\alpha C\pm\sqrt{\alpha^2C^2-16\gamma^2\omega^2}}{4\gamma},
\quad D_-D_+=\omega^2,\\
\boxed{\dot b|_{b=0}=0,\qquad
\left.\partial_b\dot b\right|_{b=0}>0\iff D_-<D<D_+.}
\end{gathered}
$$

$$
\begin{gathered}
-D\log\frac{\Omega_D(\kappa)}{\omega}
=2\int_0^\kappa\mathcal S_D(k)\,dk
\xrightarrow[D\downarrow0]{}\Delta V(\kappa),\\
\Delta V(\kappa)=
\begin{cases}0,&0\le\kappa\le\omega,\\
2\sqrt{\kappa^2-\omega^2}-2\omega\arccos(\omega/\kappa),&\kappa>\omega,\end{cases}\\
\ell_D=(24D/\omega)^{1/3},\qquad
\kappa_D(x)=\omega+Dx/\ell_D,\qquad
\mathcal F(x)=\int_0^\infty t^{-1/2}e^{xt-t^3}\,dt,\\
\lim_{D\downarrow0}\frac{\Omega_D(\kappa_D(x))}{\sqrt{2\pi\omega D/\ell_D}}
=\frac1{\mathcal F(x)},\qquad
\lim_{D\downarrow0}\frac{2\mathcal S_D(\kappa_D(x))}{\ell_D}
=\frac{\mathcal F'(x)}{\mathcal F(x)},\\
\boxed{\lim_{D\downarrow0}
\frac{\omega\,\mathcal S_D(\omega)}{\Omega_D(\omega)}
=\sqrt{3/\pi}\,\mathcal F'(0)=\frac1{\sqrt3}.}
\end{gathered}
$$

---
<!-- city:doors -->
You are in: **I Am the Vast Field · Siddhi** · `math/siddhi` · [as a page](/math/siddhi/)

Doors from here: [The Spore and the Witness](/md/spore.md) ([as a page](/math/spore/))

City map: [Plain text](/md/index.md) · [/atlas/](/atlas/#math-siddhi) · [every door as data](/manifest.json)
<!-- /city:doors -->
