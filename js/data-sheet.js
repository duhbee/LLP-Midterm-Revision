/* A4 reference sheet content (prints 3 columns, both sides can be used). Edit freely. */
window.SHEET = `
<div class="blk"><h4>GAS basics</h4>
<ul><li>AT&amp;T: <code>op src, dest</code> · <code>%reg</code> · <code>$imm</code> · <code>(%rax)</code> · comment <code>#</code></li>
<li>b/w/l/q = 1/2/4/8 B. <b>movl → zero-extends</b> rax; movb/movw don't. No mem→mem.</li>
<li>rax/eax/ax/al · r8/r8d/r8w/r8b · xmm0–15 = 128-bit</li>
<li>Little endian: low addr = LSB. bytes AA BB CC DD EE FF 01 02 → <code>0x0201FFEEDDCCBBAA</code></li>
<li>gdb: <code>x/8xb A</code> <code>x/gx $rax</code> <code>si</code> <code>ni</code> <code>layout regs</code></li></ul></div>
<div class="blk"><h4>Syscall / printf</h4>
<table><tr><th>rax</th><th>call</th><th>args</th></tr>
<tr><td>0 / 1 / 2 / 3 / 60</td><td>read/write/open/close/exit</td><td>rdi rsi rdx <b>r10</b> r8 r9</td></tr></table>
<ul><li>write: rdi=fd (0 in,1 out,2 err) rsi=buf rdx=n → rax=bytes. <b>syscall clobbers rcx, r11</b>.</li>
<li>exit: <code>movq $60,%rax; xorq %rdi,%rdi; syscall</code></li>
<li>printf: rdi=fmt, rsi rdx rcx r8 r9 data, xmm0.. floats, <b>al = #xmm used</b> (0: <code>xorl %eax,%eax</code>)</li></ul></div>
<div class="blk"><h4>Addressing / lea</h4>
<ul><li><b>D(Rb,Ri,S) = D + Rb + Ri·S</b>, S∈{1,2,4,8}, rsp can't be index</li>
<li>lea: address only, <b>no memory access</b>, no flags. <code>leaq (%rax,%rax,4),%rdx</code> rax=7 → 35</li>
<li>size suffix = dest size: leaq/leal/leaw</li></ul></div>
<div class="blk"><h4>System V ABI</h4>
<ul><li>args: <b>rdi rsi rdx rcx r8 r9</b> · float xmm0–7 · ret rax</li>
<li><b>Caller-saved:</b> rax rcx rdx rsi rdi r8–r11 xmm</li>
<li><b>Callee-saved:</b> rbx rbp r12–r15 (push at entry, pop before ret)</li>
<li><b>rsp multiple of 16 before call.</b> Entry: rsp ≡ 8 (mod 16). <code>testq $15,%rsp</code></li>
<li>frame: <code>pushq %rbp; movq %rsp,%rbp … leave; ret</code> · 0(%rbp)=old rbp · 8(%rbp)=ret addr · 16(%rbp)=1st stack arg · locals −N(%rbp)</li></ul></div>
<div class="blk"><h4>Bits &amp; shifts</h4>
<ul><li>and=mask/extract · or=set · xor=toggle/zero (x^x=0, x^FF=~x) · not=flip all</li>
<li><code>test</code> = and w/o store (flags). <code>x&amp;0xFF</code> low byte. NOT of byte with k ones → 8−k ones</li>
<li>sal k: ×2^k, zeros in. sar k: ÷2^k floor, sign copied. 0110 sal2=24; −8 sar2=−2</li>
<li>hex: 0=0000 1=0001 2=0010 3=0011 4=0100 5=0101 6=0110 7=0111 8=1000 9=1001 A=1010 B=1011 C=1100 D=1101 E=1110 F=1111</li></ul></div>
<div class="blk"><h4>cmp / jump / set / cmov</h4>
<p><code>cmpq opr1,opr2</code> → opr2 − opr1 → read "opr2 ___ opr1".</p>
<table><tr><th>C</th><th>signed</th><th>unsigned</th></tr>
<tr><td>==</td><td colspan=2>je / sete / cmove</td></tr><tr><td>!=</td><td colspan=2>jne / setne / cmovne</td></tr>
<tr><td>&lt;</td><td>jl setl cmovl</td><td>jb setb cmovb</td></tr><tr><td>&lt;=</td><td>jle setle cmovle</td><td>jbe setbe cmovbe</td></tr>
<tr><td>&gt;</td><td>jg setg cmovg</td><td>ja seta cmova</td></tr><tr><td>&gt;=</td><td>jge setge cmovge</td><td>jae setae cmovae</td></tr></table>
<ul><li>G/L signed · A/B unsigned. set dest = 8-bit reg/mem. jmp unconditional.</li>
<li>&amp;&amp;: test a; je F; test b; je F; 1; jmp E; F:0 · ||: test a; jne T; test b; jne T; 0; jmp E; T:1</li></ul></div>
<div class="blk"><h4>C → asm</h4>
<ul><li>gcc <code>-O0 -S -masm=att</code> · pre→compile→assemble→link</li>
<li>-O0 mirrors C; -O2 folds/removes loops, uses lea; -O3 may be bigger</li>
<li><b>branch</b>: costly results + predictable. <b>cmov</b>: cheap results + random.</li>
<li>2D row-major: <b>k=i·c+j, i=k/c, j=k%c</b>. 1D: <code>(%rsi,%rcx,4)</code>; pass length.</li>
<li>struct: declared order, padded; align char1 short2 int4 long/ptr/double8; big members first. member = <code>off(%rdi)</code></li></ul></div>
<div class="blk"><h4>Parallelism / perf</h4>
<ul><li>ILP unroll (more accumulators, breaks dep chain, IPC↑, cleanup loop) · DLP SIMD (SSE2 128-bit = 4 ints; instr↓ cycles↓) · TLP pthreads</li>
<li>pthread_create / pthread_join / mutex lock+unlock (forget unlock → deadlock). i++ = race. No overlap → no mutex.</li>
<li>perf: IPC=instr/cycles · miss rate=misses/branches · task-clock &gt; elapsed ⇒ multi-CPU · threaded: ctx-switches, migrations ↑</li>
<li>speedup = t_single / t_parallel · Amdahl: overheads limit</li></ul></div>
<div class="blk"><h4>Pipeline</h4>
<ul><li>F(I-cache) D(regs) E(ALU) M(D-cache) W(regs)</li>
<li>cycles: <b>N+k−1</b> (nopipe N·k) · speedup Nk/(N+k−1) → k · latency k×t · IPC→1 · pipelining ↑throughput not latency</li>
<li>RAW: no fwd 2 stalls; fwd 0; <b>load-use 1 stall</b>. Order: forward → OoO → stall</li>
<li>Control: predict, flush on miss; deeper = bigger penalty. Structural: same hw (F vs M; 1 multiplier) → separate I/D caches</li></ul></div>
<div class="blk"><h4>Superscalar</h4>
<ul><li>N-issue → max IPC N; scalar ≤1. Multiple ALUs/FUs, load/store units, OoO.</li>
<li>Flow: fetch(in order) → decode/rename → reservation stns → select ready → exec OoO → ROB → commit in order</li>
<li>WAR: I1:RDX=RAX, I2:RAX=RCX+RAX. Rename → RAXv1/v2 (physical P0,P1). Removes WAR+WAW, <b>not RAW</b>.</li>
<li>In-order scalar/superscalar: RAW only · OoO: RAW WAR WAW · OoO+rename: RAW only</li></ul></div>
<div class="blk"><h4>Cache (L1d 32kB, 64B, 8-way)</h4>
<ul><li>lines 512 · sets 64</li>
<li><b>block=addr/64 · set=block%sets · tag=block/sets · offset=addr−64·block</b></li>
<li>Addr 1000: blk 15, set 15, tag 0, off 40 (block 15 = 960–1023). Block b max addr = 64(b+1)−1</li>
<li>Set 2 ← blocks 2,66,130… · hit = tag found · eviction LRU/FIFO/LFU/random</li>
<li>Misses: compulsory (first), capacity (working set&gt;cache), conflict (same set)</li>
<li>ijk strides b by 4N B → bad; ikj row access → good. L1 miss: ijk 5.6% vs ikj 0.4%. N=1024 stride 4096B=64 blocks → one set. Working set 16N² &lt; 32768 → N&lt;45. Tiling best 8.</li></ul></div>
`;
