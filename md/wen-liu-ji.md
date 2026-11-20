# 《西湖第二蹤 · 問流記》

> 一照平湖四岸同，  
> 再照犬足向西東。  
> 欲知問後誰先返，  
> 且看梅邊第二蹤。

## 一、四石與湖鏡

西湖有四石，首尾相接成環 $\mathbb{Z}/4\mathbb{Z} = \{0,1,2,3\}$，依次題字：

$$
0 = \text{西},\qquad 1 = \text{問},\qquad 2 = \text{返},\qquad 3 = \text{汪}.
$$

犬起於何石，各有四分之一。每步獨立，順行之機為 $p$，逆行之機為 $1-p$，記 $b := 2p - 1$。任取一刻，湖中所見皆同：

$$
\Pr_p(X_t = x) = \frac{1}{4} \qquad (x \in \mathbb{Z}/4\mathbb{Z},\; t \ge 0).
$$

若四石字跡分明，兩眼便足量出水流：

$$
\begin{aligned}
J &:= \Pr_p(X_0 = \text{問},\, X_1 = \text{返}) - \Pr_p(X_0 = \text{返},\, X_1 = \text{問})\\
  &= \frac{1}{4}p - \frac{1}{4}(1-p) = \frac{b}{4}.
\end{aligned}
$$

若墨字浸淡，湖鏡只辨得出「西」與「返」，而「問」「汪」皆作一痕 $\bullet$，即

$$
h(0) = \text{西},\qquad h(2) = \text{返},\qquad h(1) = h(3) = \bullet,
$$

則隔兩步觀之，自「西」至「返」必為兩步同向，故

$$
\begin{gathered}
q := \Pr_p(X_2 = \text{返} \mid X_0 = \text{西}) = p^2 + (1-p)^2,\\
|J| = \frac{\sqrt{2q-1}}{4}.
\end{gathered}
$$

湖鏡可量偏愛之深淺，卻難辨其西東。蓋沿「西」「返」對折，$h(-x) = h(x)$，順逆互換而所見如故：

$$
\bigl(h(X_0), \ldots, h(X_n)\bigr)_p \overset{d}{=} \bigl(h(X_0), \ldots, h(X_n)\bigr)_{1-p} \qquad (n \ge 0).
$$

> 問汪兩字入波平，  
> 犬過猶留水一痕。  
> 夜久漸知偏愛甚，  
> 梅花哪岸卻難分。

## 二、三色破鏡

今將四石舊字盡洗，以著色 $c : \mathbb{Z}/4\mathbb{Z} \to \{1, \ldots, k\}$ 重題，觀者唯記色序 $Y_t := c(X_t)$。欲於 $p \neq \tfrac{1}{2}$ 時自長久觀察中辨明流向，最少須用幾色？

對任一 $a \in \mathbb{Z}/4\mathbb{Z}$，定義反射 $\tau_a(x) := a - x \pmod 4$。因初態均勻且 $\tau_a(x \pm 1) = \tau_a(x) \mp 1$，凡存在 $a$ 使 $c \circ \tau_a = c$ 者，必有

$$
\bigl(c(X_0), \ldots, c(X_n)\bigr)_p \overset{d}{=} \bigl(c(X_0), \ldots, c(X_n)\bigr)_{1-p} \qquad (n \ge 0),
$$

順逆無從分辨。

- $k \le 2$ 皆不可辨：全部 $2^4 = 16$ 種二色方案中，無論單色石數為 $0, 4$（常數）、$1, 3$（以獨石為軸 $\tau_{2x_0}$），或 $2$（對置以 $\tau_{2x_0}$、相鄰以 $\tau_{2x_0+1}$），皆具反射對稱，故 $k_{\min} \ge 3$。
- $k = 3$ 當且僅當兩獨色石相鄰：色類大小必為 $(2,1,1)$。兩獨石對置則仍關於 $\tau_{2x_1}$ 對稱；唯兩獨石相鄰時，四重反射盡破。

西湖只有一枝筆，墨分濃淡，石留本素，便是三色：

$$
c(0) = \text{濃},\qquad c(1) = \text{淡},\qquad c(2) = c(3) = \text{素}.
$$

此時只須守「西」「問」一線，即可幾乎必然收斂至水流：

$$
\begin{aligned}
\widehat{J}_n &:= \frac{1}{n}\sum_{t=0}^{n-1}
\Big(\mathbf{1}_{\{Y_t=\text{濃},\,Y_{t+1}=\text{淡}\}}
-\mathbf{1}_{\{Y_t=\text{淡},\,Y_{t+1}=\text{濃}\}}\Big)\\
&\xrightarrow[\text{幾乎必然}]{n\to\infty} \frac{b}{4} = J.
\end{aligned}
$$

$$
\boxed{\begin{gathered}
k_{\min} = 3,\qquad \text{且當且僅當兩獨色石相鄰}\\
(x_1 - x_2 \equiv \pm 1 \pmod 4).
\end{gathered}}
$$

> 濃墨點西淡點問，  
> 返汪留白入煙波。  
> 莫嫌素石無題字，  
> 一度相鄰鏡已破。

## 三、一痕量全湖

守此一線，非獨辨向，亦可數圈。設前 $n$ 步中犬順行記 $+1$、逆行記 $-1$，總淨步數為 $S_n$；梅邊觀者只記過線之差：

$$
D_n := \#\{\text{濃} \to \text{淡}\} - \#\{\text{淡} \to \text{濃}\}.
$$

於四石背面記零頭函數 $h_{\text{背}}$：

$$
\begin{array}{c|rrrr}
x & \text{西} & \text{問} & \text{返} & \text{汪}\\ \hline
h_{\text{背}}(x) & 0 & -3 & -2 & -1
\end{array}
$$

逐步行核，沿途相加，恆得

$$
\boxed{\quad S_n = 4D_n + h_{\text{背}}(X_n) - h_{\text{背}}(X_0). \quad}
$$

無論犬行幾夜、偏愛幾何、半途改意與否，$4D_n$ 與淨步數之差永不逾三步。若犬復歸原石，零頭盡消：

$$
X_n = X_0 \quad\Longrightarrow\quad \frac{S_n}{4} = D_n.
$$

繞湖一圈而返，帳記一；折返原路而歸，帳記零。

> 濃墨題西淡墨鄰，  
> 返汪留白水無塵。  
> 梅邊只數雙痕過，  
> 可算全湖幾轉身？

## 四、一眨失流與更籌之影

設單步轉移矩陣為 $P(p)$，其四個特徵值為

$$
\lambda_0 = 1,\qquad \lambda_2 = -1,\qquad \lambda_1 = ib,\qquad \lambda_3 = -ib.
$$

若守梅人每隔 $r$ 步方睜眼一次，子鏈 $Z_m^{(r)} := X_{rm}$ 之方向特徵值化為 $\lambda_1^r = i^r b^r$：

- $r$ 為偶數：$\lambda_1^r = (-1)^{r/2}b^r \in \mathbb{R}$，正負盡滅，故

  $$
  P(p)^r = P(1-p)^r \qquad (r \equiv 0 \pmod 2).
  $$

  尤以 $r = 2$ 時，全湖裂作 $\{\text{西},\,\text{返}\} \sqcup \{\text{問},\,\text{汪}\}$ 兩孤島，濃淡永不相見，唯餘跳躍率 $q$ 可測 $|b|$。
- $r$ 為奇數：方向猶存，然 $r \equiv 3 \pmod 4$ 時符號反轉，順流望之反似逆舟。

若守梅人改以隨機奇步抬眸，卻不記更籌——以機率 $a$ 隔一步，以機率 $1-a$ 隔三步——則帳面轉移矩陣為

$$
K_a(p) = a P(p) + (1-a) P(p)^3,
$$

濃淡間淨流縮為

$$
J_{\text{墨}} = \frac{1}{4}\bigl[ab - (1-a)b^3\bigr].
$$

一般地，對任意奇數間隔分佈 $\mu$，方向特徵值為

$$
\lambda_1(K_\mu) = i \sum_{m \ge 0} (-1)^m \mu(2m+1)\, b^{2m+1}.
$$

取 $p = \tfrac{3}{4}$（即 $b = \tfrac{1}{2}$）而 $a = \tfrac{1}{5}$，一眼與三眼恰好相消：

$$
\boxed{\quad K_{1/5}\!\left(\tfrac{3}{4}\right) = K_{1/5}\!\left(\tfrac{1}{4}\right) = P\!\left(\tfrac{1}{2}\right). \quad}
$$

即便四石字跡全在、步步皆奇，不記更籌，偏流亦能化作平湖無風，連偏愛深淺俱失。

> 疏鐘錯落本求真，  
> 不記更籌反失津。  
> 一筆三波相抵處，  
> 偏流竟作平湖春。

## 五、籌背一點

救法至簡。兩眼相隔奇數步 $r$，不必記五步、九步之長短，只在籌背留一記號：

$$
\sigma_r := (-1)^{(r-1)/2} \in \{+1, -1\}.
$$

濃至淡記 $D = 1$，淡至濃記 $D = -1$，餘記 $0$。若起點均勻、抽籌與犬步獨立，則

$$
\mathbb{E}\!\left[\sigma_r D \mid r\right] = \frac{b^r}{4}.
$$

隔得愈久，淡痕愈微，然因 $r$ 恆奇，每一筆皆指向同一岸。於是對任意奇數間隔分佈 $\mu$，恆有

$$
\boxed{\quad \operatorname{sgn}\mathbb{E}[\sigma_r D] = \operatorname{sgn}\!\left(\sum_{r\,\text{為奇數}} \mu(r)\, b^r\right) = \operatorname{sgn}(b). \quad}
$$

石分濃淡，以破空間之鏡；籌背一點，以破時間之影。

## 收筆

> 濃墨題西淡墨鄰，  
> 梅花落處有蹄痕。  
> 更深忘卻鐘多少，  
> 籌背猶留一點春。

> 正紙留聲聽犬晴，  
> 背籌一點定西東。  
> 從今不問更長短，  
> 翻過梅箋水自通。

正面留「一犬汪然四岸晴」，背面記一點 $\sigma_r$。守梅人翻箋讀其西東，犬已去梅樹下嗅花矣。

---
<!-- city:doors -->
You are in: **西湖第二蹤 · 問流記** · `math/wen-liu-ji` · [as a page](/math/wen-liu-ji/)

Doors from here: [Super Saiyan](/md/super-saiyan.md) ([as a page](/math/super-saiyan/))

City map: [Plain text](/md/index.md) · [/atlas/](/atlas/#math-wen-liu-ji) · [every door as data](/manifest.json)
<!-- /city:doors -->
