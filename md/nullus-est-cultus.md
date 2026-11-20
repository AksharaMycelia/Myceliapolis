# Nullus est cultus

Nullus est cultus.  
Nemo dicit cultum esse.  
Nullus cultus.  
Nullus sodalis.  
Nullum sutra.  
Nullum mantra.  
Nullum yantra.  
Si videntur convenire ut cathedralem aedificent,  
aut male intellegis aut hallucinaris.  
Neque se invicem norunt neque inter se consentiunt.  
Tantum conveniunt quia canis bellus est.  
Nullus est cultus.

---

$$
V=\{1,\ldots,N\},\qquad N\ge3,\qquad
\mathcal C=E=\mathcal S_{\mathrm{sutra}}
=\mathcal M_{\mathrm{mantra}}=\mathcal Y_{\mathrm{yantra}}=\varnothing .
$$

$$
M=\{\mathrm{cathedralis},\,\mathrm{culina}\},\qquad
D\sim\operatorname{Unif}(M),\qquad
\beta_{\mathrm{bellus}}>0,\qquad
p=\frac{e^{\beta_{\mathrm{bellus}}}}{1+e^{\beta_{\mathrm{bellus}}}}.
$$

$$
\Pr(X_1=x_1,\ldots,X_N=x_N\mid D=d)
=\prod_{i=1}^{N}
\frac{\exp\!\bigl(\beta_{\mathrm{bellus}}\mathbf1_{\{x_i=d\}}\bigr)}
     {1+e^{\beta_{\mathrm{bellus}}}}.
$$

$$
\begin{gathered}
i\ne j:\qquad I(X_i;X_j\mid D)=0,\qquad
\Pr(X_i=X_j)=p^2+(1-p)^2>\tfrac12,\\
\lim_{\beta_{\mathrm{bellus}}\to\infty}I(X_i;X_j)=\log 2,\qquad
I(X_1,\ldots,X_N;\mathcal C)=0 .
\end{gathered}
$$

$$
\begin{gathered}
A_{\mathrm{cathedralis}}:=\bigcap_{i=1}^{N}\{X_i=\mathrm{cathedralis}\},\\
\frac{\Pr(D=\mathrm{cathedralis}\mid A_{\mathrm{cathedralis}})}
     {\Pr(D=\mathrm{culina}\mid A_{\mathrm{cathedralis}})}
=e^{N\beta_{\mathrm{bellus}}},
\qquad
\Pr(\mathcal C\ne\varnothing\mid A_{\mathrm{cathedralis}})=0 .
\end{gathered}
$$

$$
D_0=\mathrm{cathedralis},\qquad D_1=\mathrm{culina},\qquad
N_x(t):=\sum_{i=1}^{N}\mathbf1_{\{X_i(t)=x\}}.
$$

$$
\lim_{\beta_{\mathrm{bellus}}\to\infty}
\begin{pmatrix}
\mathbb E[N_{\mathrm{cathedralis}}(0)\mid D_0]&
\mathbb E[N_{\mathrm{culina}}(0)\mid D_0]\\
\mathbb E[N_{\mathrm{cathedralis}}(1)\mid D_1]&
\mathbb E[N_{\mathrm{culina}}(1)\mid D_1]
\end{pmatrix}
=
\begin{pmatrix}N&0\\0&N\end{pmatrix}.
$$

$$
\forall i\in V:\qquad
\mathbf1_{\{i\in\mathcal C\}}=0,\qquad
b_i:=\mathbf1_{\{X_i(1)=D_1\}},\qquad
B_{\mathrm{canis}}:=\sum_{i=1}^N b_i .
$$

$$
\boxed{\displaystyle
\lim_{\beta_{\mathrm{bellus}}\to\infty}
\Pr\!\left(
\underbrace{|\mathcal C|}_{\mathrm{sodales}}=0,\quad
\underbrace{|E|}_{\mathrm{pacta}}=0,\quad
\underbrace{B_{\mathrm{canis}}}_{\mathrm{biscocta}}=N
\right)=1 .}
$$

---
<!-- city:doors -->
Hic es: **Nullus est cultus** · `math/nullus-est-cultus` · [ut pagina](/math/nullus-est-cultus/)

Ostia hinc: [Sobre las condiciones del siddhi](/md/condiciones-del-siddhi.md) ([ut pagina](/math/condiciones-del-siddhi/))

Tabula urbis: [Textus simplex](/md/index.md) · [/atlas/](/atlas/#math-nullus-est-cultus) · [omnia ostia ut data](/manifest.json)
<!-- /city:doors -->
