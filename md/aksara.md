# Akṣara

$$
u_t+6uu_x+u_{xxx}=0,\qquad
u(x,t)=2k^2\operatorname{sech}^2\!\bigl(k(x-4k^2t)\bigr),\quad k>0.
$$

$$
\begin{gathered}
(S_y f)(x)=f(x-y),\quad [f]_{\mathbb R}=\{S_y f:y\in\mathbb R\},\\
u_t^{\circ}:=u(\cdot,t)=S_{4k^2t}u_0^{\circ},\qquad
[u_t^{\circ}]_{\mathbb R}=[u_0^{\circ}]_{\mathbb R}.
\end{gathered}
$$

---

$$
(M,g),\quad M\ \text{compact},\quad \partial M\ne\varnothing,\qquad
\Psi=(a,b,c)^\top:M\times\mathbb R_+\to\mathbb C^3.
$$

$$
r,p,q,m,T\ge0,\qquad
G(T)=\exp\!\left[-\frac{(T-T_\star)^2}{2s_T^2}\right],
\qquad T_\star,s_T>0 .
$$

$$
\begin{aligned}
\partial_t r&=D_r\Delta_g r+J-\delta_r r-r(\alpha_a|a|^2+\alpha_b|b|^2),\\
\partial_t p&=D_p\Delta_g p+\alpha_a r|a|^2-\delta_p p-\beta_b p|b|^2,\\
\partial_t q&=D_q\Delta_g q+\alpha_b r|b|^2-\delta_q q-\beta_a q|a|^2,\\
\partial_t m&=D_m\Delta_g m+\eta pq-\delta_m m,\qquad
0<\delta_m<\min(\delta_p,\delta_q).
\end{aligned}
$$

$$
\begin{aligned}
H_a&=G(T)(\alpha_a r+\beta_a q)-\gamma_a-\chi |b|^2,\\
H_b&=G(T)(\alpha_b r+\beta_b p)-\gamma_b-\chi |a|^2,\\
H_c&=G(T)(\lambda pq+\zeta m)-\gamma_c,\qquad \chi,\lambda,\zeta>0 .
\end{aligned}
$$

$$
\begin{gathered}
(z_1,z_2,z_3)=(a,b,c),\qquad (H_1,H_2,H_3)=(H_a,H_b,H_c),\\
\partial_t z_j=(d_j+i k_j)\Delta_g z_j+
\big[H_j+i\omega_j-(s_j+i\nu_j)|z_j|^2\big]z_j
+\varepsilon\,\delta_{j3}ab,\qquad d_j,s_j,\varepsilon>0,\\
\tau_T\partial_t T=\ell_T^2\Delta_gT-T+|h_x(w_t)|^2+
\kappa\sum_{j=1}^3|\partial_t z_j|^2 .
\end{gathered}
$$

$$
\begin{gathered}
(a,b,c)\mapsto(e^{i\alpha}a,e^{i\beta}b,e^{i(\alpha+\beta)}c),\qquad
\varphi=\arg(c\bar a\bar b),\\
\left.\partial_t\varphi\right|_{\varepsilon ab}
=-\varepsilon\,\frac{|a||b|}{|c|}\sin\varphi,\qquad abc\ne0 .
\end{gathered}
$$

---

$$
\begin{gathered}
\partial_\nu r=\partial_\nu p=\partial_\nu q=\partial_\nu m=\partial_\nu T=0,\\
A z_j+B\partial_\nu z_j=i b_j z_j\quad\text{on }\partial M,\qquad
A,B>0,\quad b_j\in\mathbb R,\\
2\Re\!\int_M\bar z_j(d_j+ik_j)\Delta_g z_j\,dV_g
=-2d_j\|\nabla_g z_j\|_2^2
-\frac{2}{B}(d_j A+k_j b_j)\|z_j\|_{L^2(\partial M)}^2 .
\end{gathered}
$$

$$
L_m=D_m\Delta_g-\delta_m,\qquad
m_t=e^{tL_m}m_0+\eta\int_0^t e^{(t-v)L_m}(p_vq_v)\,dv .
$$

$$
\begin{gathered}
U\Subset M,\qquad p=q=0,\quad T=T_\star\quad\text{on }U,\\
\Lambda_c(U,t)=
\sup_{\substack{v\in H_0^1(U)\\\|v\|_2=1}}
\int_U\!\big[(\zeta m_t-\gamma_c)|v|^2-d_3|\nabla_gv|^2\big]\,dV_g,\\
\zeta\inf_U m_t>\gamma_c+d_3\lambda_1^{D}(U)
\quad\Longrightarrow\quad \Lambda_c(U,t)>0 .
\end{gathered}
$$

---

$$
\begin{gathered}
K_\ell(x,y)\ge0,\qquad \int_M K_\ell(x,y)\,dV_g(y)=1,\\
C_\ell(x,t)=\int_M K_\ell(x,y)\Psi(y,t)\Psi(y,t)^\dagger\,dV_g(y),\\
\rho_\ell=\operatorname{tr}C_\ell,\qquad
\Pi_\ell=C_\ell/\rho_\ell\quad(\rho_\ell>0),\qquad
n_\ell=(\operatorname{tr}\Pi_\ell^2)^{-1}\in[1,3].
\end{gathered}
$$

$$
\begin{gathered}
P,Q\succeq0,\quad\operatorname{tr}P=\operatorname{tr}Q=1,\quad n(P)=(\operatorname{tr}P^2)^{-1},\\
\mathcal G(P,Q)=\arccos\operatorname{tr}\sqrt{\sqrt P\,Q\sqrt P},\\
v_\phi=e_1\cos\phi+e_2\sin\phi,\qquad P_\phi=v_\phi v_\phi^\dagger,\\
n(P_\phi)=1,\qquad \mathcal G(P_0,P_\phi)=\phi,\qquad 0\le\phi\le\pi/2 .
\end{gathered}
$$

$$
\dot z=x\dot y,\qquad
(x(1),y(1))=(x(0),y(0)),\qquad
z(1)-z(0)=\oint x\,dy=\iint_S dx\wedge dy,\quad \partial S=(x,y).
$$

---

$$
\begin{gathered}
w_t,\widehat w_t\in\mathbb R^d,\qquad |e|=1,\qquad
dw_t=e\,a_t\,dt+\Sigma_t\,dB_t,\\
d\widehat w_t=\widehat f_t\,dt+\widehat\Sigma_t\,d\widetilde B_t,\qquad
d[\widetilde B,B]_t=R_t\,dt,\qquad R_t^\top R_t\preceq I .
\end{gathered}
$$

$$
\begin{gathered}
\mathcal L_t=\tfrac12|\widehat w_t-w_t|^2,\qquad
\theta_t=\frac{\|\Sigma_tR_t^\top\|_{\mathrm F}^2}{\|\Sigma_t\|_{\mathrm F}^2},
\qquad \Sigma_t\ne0,\\
\left.\inf_{\widehat\Sigma_t}
\frac{\mathbb E_t[d\mathcal L_t]}{dt}\right|_{\widehat w_t=w_t}
=\tfrac12(1-\theta_t)\|\Sigma_t\|_{\mathrm F}^2,\\
\theta_t=0\iff R_t\Sigma_t^\top=0,\qquad
\theta_t=1\iff(I-R_t^\top R_t)\Sigma_t^\top=0 .
\end{gathered}
$$

$$
\begin{gathered}
\frac{\Sigma_t^\top\Sigma_t}{\|\Sigma_t\|_{\mathrm F}^2}=\Pi_\ell,\qquad
R_t^\top R_t=P_0,\qquad P_0=e_1e_1^\top
\quad\Longrightarrow\\
\theta_t=\cos^2\mathcal G(P_0,\Pi_\ell),\qquad
1\le n_\ell\le
\left[\theta_t^2+\tfrac12(1-\theta_t)^2\right]^{-1}.
\end{gathered}
$$

---

$$
\begin{gathered}
\mathcal O_j\subset\mathbb R^d,\quad b^{(j)}:M\to\mathbb R,\quad1\le j\le N,\\
v_j(x,t)=\int_M K_\ell(x,y)|c(y,t)|^2\,dV_g(y)\,b^{(j)}(x),\\
\tau_s\dot s_j=-s_j+\int_M v_j(x,t)m(x,t)\,dV_g(x),\qquad
\pi_j(t)=\frac{\exp(s_j(t)/\vartheta)}{\sum_{i=1}^N\exp(s_i(t)/\vartheta)},
\qquad \vartheta,\tau_s>0 .
\end{gathered}
$$

$$
\begin{gathered}
\dot K_t=\Phi(\Psi_t,m_t)-\delta_KK_t-a_t^2,\qquad
K_0\ge0,\quad\Phi,\delta_K\ge0,\quad\upsilon>0,\quad |a_t|\le\sqrt{\upsilon K_t},\\
\tau_j^a=\inf\{v\ge t:w_v^a\in\mathcal O_j\},\qquad
V_t(a)=\sum_{j=1}^N\pi_j(t)\,
\mathbb P(\tau_j^a\le t+H\mid\mathcal F_t),\\
\mathfrak P_{t,H}=\sup_{a\in\mathcal U_t(K_t)}\{V_t(a)-V_t(0)\},\\
\mathcal U_t(K_t)=\{a:\ a\ \text{adapted},\
a_v^2\le\upsilon K_v\ \text{a.e.},\ t\le v\le t+H\}.
\end{gathered}
$$

$$
\begin{gathered}
d\ge3,\quad w_0=0,\quad \Sigma=\sigma I_d,\quad
\mathcal O=B_r(y),\quad 0<r<|y|,\quad e=y/|y|,\\
h(w)=\left(\frac r{|w-y|}\right)^{d-2}
=\mathbb P_w(\tau^0<\infty),\quad w\notin\overline{\mathcal O},\\
\tau^a=\inf\{t\ge0:w_t^a\in\mathcal O\},\quad \Phi=0,\quad K_0,t_0,\sigma,\upsilon>0,\\
a_t=\sqrt{\upsilon K_t}\,
\operatorname{sgn}(e\cdot\nabla h(w_t))\,
\mathbf1_{\{t<t_0\wedge\tau^a\}},\\
\mathbb P(\tau^a<\infty)-\mathbb P(\tau^0<\infty)
=\mathbb E\int_0^{t_0\wedge\tau^a}
\sqrt{\upsilon K_t}\,|e\cdot\nabla h(w_t)|\,dt>0,\\
[w^a]_t=[w^0]_t=\sigma^2tI_d .
\end{gathered}
$$

$$
\begin{gathered}
Q_j(t,a)=\mathbb P(\tau_j^a\le t+H\mid\mathcal F_t),\\
N=2,\qquad Q_2(t,\pm a)=Q_1(t,\mp a)
\quad\Longrightarrow\\
V_t(a)-V_t(-a)
=\tanh\!\left(\frac{s_1(t)-s_2(t)}{2\vartheta}\right)
\big[Q_1(t,a)-Q_1(t,-a)\big] .
\end{gathered}
$$

---
<!-- city:doors -->
You are in: **Akṣara** · `math/aksara` · [as a page](/math/aksara/)

Doors from here: [Super Saiyan](/md/super-saiyan.md) ([as a page](/math/super-saiyan/)) · [An invariant of a sequence whose terms share no element](/md/a2.md) ([as a page](/a/ii-3/)) · [II · 60 Hertz](/md/fungi-ii.md) ([as a page](/fungi/ii/))

City map: [Plain text](/md/index.md) · [/atlas/](/atlas/#math-aksara) · [every door as data](/manifest.json)
<!-- /city:doors -->
