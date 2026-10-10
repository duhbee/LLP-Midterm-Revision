/* Teaching helper: decodes instructions and explains key terms for any question.
   TEACH.panel(question, chosenText) -> HTML shown under the answer. */
window.TEACH = (function () {
  'use strict';
  const strip = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* ---------- sizes ---------- */
  const SUF = { b: [1, 'byte'], w: [2, 'word'], l: [4, 'long'], q: [8, 'quad'] };

  /* ---------- registers ---------- */
  const ROLE = {
    rax: 'return value; also holds the syscall number. Caller-saved',
    rbx: 'general purpose. Callee-saved (a function must restore it)',
    rcx: '4th function argument. Caller-saved; overwritten by syscall',
    rdx: '3rd function argument (3rd syscall arg). Caller-saved',
    rsi: '2nd function argument (2nd syscall arg, e.g. write buffer). Caller-saved',
    rdi: '1st function argument (1st syscall arg, e.g. fd / printf format). Caller-saved',
    rbp: 'frame (base) pointer. Callee-saved',
    rsp: 'stack pointer — top of the stack. Must be 16-byte aligned before call',
    r8: '5th function argument. Caller-saved', r9: '6th function argument. Caller-saved',
    r10: '4th syscall argument. Caller-saved', r11: 'scratch. Caller-saved; overwritten by syscall',
    r12: 'callee-saved', r13: 'callee-saved', r14: 'callee-saved', r15: 'callee-saved'
  };
  function reg(name) {
    name = name.replace('%', '').toLowerCase();
    let m, parent, bits;
    if ((m = name.match(/^r(ax|bx|cx|dx|si|di|bp|sp)$/))) { parent = name; bits = 64; }
    else if ((m = name.match(/^e(ax|bx|cx|dx|si|di|bp|sp)$/))) { parent = 'r' + m[1]; bits = 32; }
    else if ((m = name.match(/^(ax|bx|cx|dx|si|di|bp|sp)$/))) { parent = 'r' + m[1]; bits = 16; }
    else if ((m = name.match(/^([abcd])l$/))) { parent = 'r' + m[1] + 'x'; bits = 8; }
    else if ((m = name.match(/^(si|di|bp|sp)l$/))) { parent = 'r' + m[1]; bits = 8; }
    else if ((m = name.match(/^r(\d+)([dwb]?)$/))) { parent = 'r' + m[1]; bits = { '': 64, d: 32, w: 16, b: 8 }[m[2]]; }
    else if ((m = name.match(/^xmm(\d+)$/))) return { name, bits: 128, text: `<code>%${name}</code> — 128-bit floating-point / SIMD register (16 bytes, e.g. four 32-bit ints)` };
    else return null;
    const part = bits === 64 ? 'full 64-bit register' : `low ${bits} bits of <code>%${parent}</code>`;
    return { name, bits, parent, text: `<code>%${name}</code> — ${part}. ${ROLE[parent] ? ROLE[parent].charAt(0).toUpperCase() + ROLE[parent].slice(1) : ''}.` };
  }

  /* ---------- conditions ---------- */
  const COND = {
    e: ['equal', 'ZF = 1, signed or unsigned'], ne: ['not equal', 'signed or unsigned'], z: ['zero', ''], nz: ['not zero', ''],
    g: ['greater', 'signed'], ge: ['greater or equal', 'signed'], l: ['less', 'signed'], le: ['less or equal', 'signed'],
    a: ['above (greater)', 'unsigned'], ae: ['above or equal', 'unsigned'], b: ['below (less)', 'unsigned'], be: ['below or equal', 'unsigned']
  };

  /* ---------- mnemonics ---------- */
  const BASE = {
    mov: 'MOVe', lea: 'Load Effective Address', add: 'ADD', sub: 'SUBtract', imul: 'signed Integer MULtiply',
    and: 'bitwise AND', or: 'bitwise OR', xor: 'bitwise eXclusive OR', not: 'bitwise NOT', neg: 'NEGate',
    inc: 'INCrement', dec: 'DECrement', cmp: 'CoMPare', test: 'TEST (AND for flags only)',
    sal: 'Shift Arithmetic Left', sar: 'Shift Arithmetic Right', shl: 'SHift Left', shr: 'SHift Right (logical)',
    push: 'PUSH onto stack', pop: 'POP from stack'
  };
  const LONE = {
    ret: '<b>ret</b> (RETurn) — pops the return address off the stack and jumps back to the caller.',
    leave: '<b>leave</b> — tears down the stack frame: <code>movq %rbp,%rsp</code> then <code>popq %rbp</code>.',
    syscall: '<b>syscall</b> — asks the Linux kernel to run system call number <code>%rax</code> (args rdi, rsi, rdx, r10, r8, r9). Overwrites rcx and r11.',
    call: '<b>call</b> — pushes the 8-byte return address, then jumps to the function.'
  };

  function splitOps(s) {
    const out = []; let depth = 0, cur = '';
    for (const ch of s) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && !depth) { out.push(cur.trim()); cur = ''; } else cur += ch; }
    if (cur.trim()) out.push(cur.trim()); return out;
  }
  function operand(o) {
    let m;
    if ((m = o.match(/^\$(.+)$/))) return { kind: 'imm', text: `the constant ${esc(m[1])}` };
    if ((m = o.match(/^%(\w+)$/))) { const r = reg(m[1]); return { kind: 'reg', reg: r, text: `<code>%${m[1]}</code>` }; }
    if ((m = o.match(/^(-?[\w]*)\((%\w+)?(?:,\s*(%\w+)?(?:,\s*(\d))?)?\)$/))) {
      const parts = []; if (m[1]) parts.push(m[1]); if (m[2]) parts.push(m[2]); if (m[3]) parts.push(m[3] + (m[4] && m[4] !== '1' ? '×' + m[4] : ''));
      return { kind: 'mem', expr: parts.join(' + ') || '0', text: `memory at address <b>${esc(parts.join(' + '))}</b>` };
    }
    return { kind: 'label', text: `label <code>${esc(o)}</code>` };
  }

  /* Returns an explanation of an AT&T instruction string, or null if it isn't one. */
  function instr(raw) {
    const s = strip(raw);
    if (LONE[s]) return LONE[s];
    const m = s.match(/^([a-z]+)\s+(.+)$/); if (!m) return null;
    let mn = m[1]; const rawOps = splitOps(m[2]);
    if (!rawOps.length || rawOps.length > 2 || rawOps.some((o) => /\s/.test(o) || !/^[%$\-\w(]/.test(o))) return null; // English, not asm
    const ops = rawOps.map(operand);
    const TWO = /^(mov|lea|add|sub|and|or|xor|cmp|test)$/;
    let cm;
    if ((cm = mn.match(/^j(mp|n?e|n?z|ge?|le?|ae?|be?)$/))) {
      if (cm[1] === 'mp') return `<b>jmp</b> (JuMP) — always jumps to ${ops[0].text}; ignores the flags.`;
      const c = COND[cm[1]]; return `<b>${mn}</b> = Jump if ${c[0]} (${c[1]}) — after <code>cmp a, b</code>, jumps to ${ops[0].text} if <b>b ${c[0]} a</b>; otherwise falls through.`;
    }
    if ((cm = mn.match(/^set(n?e|n?z|ge?|le?|ae?|be?)$/))) {
      const c = COND[cm[1]]; return `<b>${mn}</b> = SET byte if ${c[0]} (${c[1]}) — writes 1 into ${ops[0].text} if the condition holds, else 0. Destination must be 8-bit.`;
    }
    if ((cm = mn.match(/^cmov(n?e|ge?|le?|ae?|be?)[wlq]?$/))) {
      const c = COND[cm[1]]; return `<b>${mn}</b> = Conditional MOVe if ${c[0]} (${c[1]}) — copies ${ops[0].text} into ${ops[1] ? ops[1].text : 'the destination'} only if the last compare said ${c[0]}. No jump.`;
    }
    let base = mn, suf = '';
    if (!BASE[base] && BASE[mn.slice(0, -1)] && SUF[mn.slice(-1)]) { base = mn.slice(0, -1); suf = mn.slice(-1); }
    if (!BASE[base]) return null;
    if (TWO.test(base) && ops.length !== 2) return null;
    const size = suf ? ` · suffix <b>${suf}</b> = ${SUF[suf][1]}, ${SUF[suf][0]} byte${SUF[suf][0] > 1 ? 's' : ''} (${SUF[suf][0] * 8}-bit)` : '';
    const head = `<b>${mn}</b> = ${BASE[base]}${size}`;
    const [a, b] = ops; let act = '';
    const nb = suf ? SUF[suf][0] + ' bytes' : 'the value';
    switch (base) {
      case 'mov':
        if (a.kind === 'mem') act = `<b>reads ${nb} from ${a.text}</b> (dereferences memory) and copies them into ${b.text}.`;
        else if (b && b.kind === 'mem') act = `writes ${nb} of ${a.text} into ${b.text}.`;
        else if (a.kind === 'imm' && b && b.kind === 'imm') act = 'invalid — the destination cannot be a constant.';
        else act = `copies ${a.text} into ${b.text}.`;
        if (a.kind === 'mem' && b && b.kind === 'mem') act = 'invalid — x86-64 has no memory-to-memory mov.';
        if (suf === 'l' && b && b.reg && b.reg.bits === 32) act += ' Writing a 32-bit register also <b>zero-extends</b> the upper 32 bits.';
        break;
      case 'lea': act = `computes the address <b>${a.expr || a.text}</b> and puts that <b>number itself</b> into ${b.text}. It does <b>not</b> read memory and doesn't set flags.`; break;
      case 'add': act = `${b.text} = ${b.text} + ${a.text}.`; break;
      case 'sub': act = `${b.text} = ${b.text} − ${a.text}.`; break;
      case 'imul': act = b ? `${b.text} = ${b.text} × ${a.text}.` : `multiplies by ${a.text}.`; break;
      case 'and': case 'or': case 'xor':
        act = `${b.text} = ${b.text} ${base.toUpperCase()} ${a.text}, bit by bit.` + (base === 'xor' && strip(m[2]).split(',').map((x) => x.trim()).every((x, i, arr) => x === arr[0]) ? ' XOR with itself sets the register to 0.' : ''); break;
      case 'not': act = `flips every bit of ${a.text}.`; break;
      case 'neg': act = `${a.text} = −${a.text}.`; break;
      case 'inc': act = `${a.text} = ${a.text} + 1.`; break;
      case 'dec': act = `${a.text} = ${a.text} − 1.`; break;
      case 'cmp': act = `computes <b>${b ? b.text : '?'} − ${a.text}</b> only to set the flags (nothing stored). Read the next jump as "${b ? b.text : 'opr2'} ? ${a.text}".`; break;
      case 'test': act = `ANDs ${a.text} with ${b ? b.text : '?'} only to set the flags (result discarded). <code>test r,r</code> sets ZF when r = 0.`; break;
      case 'sal': case 'shl': act = `shifts ${b ? b.text : a.text} left${b ? ' by ' + a.text : ''} — multiplies by 2 per bit; zeros enter on the right.`; break;
      case 'sar': act = `shifts ${b ? b.text : a.text} right${b ? ' by ' + a.text : ''}, copying the sign bit in — divides a signed value by 2 per bit (rounds down).`; break;
      case 'shr': act = `shifts right, filling with zeros — unsigned divide by 2 per bit.`; break;
      case 'push': act = `rsp −= 8, then stores ${a.text} at the new top of stack.`; break;
      case 'pop': act = `copies the top of the stack into ${a.text}, then rsp += 8.`; break;
    }
    // size mismatch check
    if (suf) {
      const want = SUF[suf][0] * 8;
      const bad = ops.filter((o) => o.reg && o.reg.bits !== 128 && o.reg.bits !== want && !(base === 'lea' && o === a));
      if (bad.length) act += ` <span class="warnt">⚠ Size mismatch: <b>${suf}</b> means ${want}-bit but ${bad.map((o) => '<code>%' + o.reg.name + '</code> is ' + o.reg.bits + '-bit').join(', ')} → invalid.</span>`;
    }
    return `<code>${esc(s)}</code><br>${head} — ${act}`;
  }

  /* ---------- concept glossary ---------- */
  const G = [
    [/\blea[bwlq]?\b/i, 'lea', '<b>Load Effective Address</b>: does the address arithmetic D + base + index×scale and keeps the number. No memory read. Often used for cheap add/multiply.'],
    [/\bmov[bwlq]?\b/i, 'mov', '<b>MOVe</b>: copy source → destination (AT&T order). With ( ) around an operand it reads/writes memory.'],
    [/\bsuffix|\b[bwlq] suffix|\bmov[bwlq]\b|\blea[bwlq]\b/i, 'b / w / l / q', 'Size suffixes: <b>b</b>yte 1 B (8-bit) · <b>w</b>ord 2 B (16-bit) · <b>l</b>ong 4 B (32-bit) · <b>q</b>uad 8 B (64-bit).'],
    [/effective address|D\(|\(%\w+,%\w+/i, 'Effective address', '<b>D(Rb, Ri, S) = D + Rb + Ri × S</b>. D = displacement, Rb = base register, Ri = index register, S = scale (1, 2, 4 or 8).'],
    [/dereferenc/i, 'Dereference', 'Using an address to read/write the memory it points to. <code>(%rax)</code> dereferences; <code>lea</code> never does.'],
    [/scale/i, 'Scale factor', 'S in D(Rb,Ri,S): multiplies the index — normally the element size (int = 4, long = 8). Only 1, 2, 4, 8 allowed.'],
    [/displacement/i, 'Displacement', 'D in D(Rb,Ri,S): a constant byte offset added to the address.'],
    [/zero-extend/i, 'Zero-extend', 'Fill the upper bits with 0. Writing a 32-bit register (e.g. movl to %eax) zero-extends into the full 64-bit register.'],
    [/sign-extend/i, 'Sign-extend', 'Fill the upper bits with copies of the sign bit (keeps negative numbers negative).'],
    [/little.?endian/i, 'Little endian', 'The byte at the <b>lowest</b> address is the <b>least significant</b> byte.'],
    [/syscall|system call/i, 'syscall', 'Kernel call: number in rax (0 read, 1 write, 2 open, 3 close, 60 exit); args rdi, rsi, rdx, r10, r8, r9. Clobbers rcx, r11.'],
    [/printf/i, 'printf from asm', 'rdi = format string, then rsi, rdx, rcx, r8, r9 for data; floats in xmm0…; %al = number of xmm registers used (0 if none).'],
    [/callee-saved/i, 'Callee-saved', 'rbx, rbp, r12–r15. The <b>called</b> function must restore them (push at entry, pop before ret).'],
    [/caller-saved/i, 'Caller-saved', 'rax, rcx, rdx, rsi, rdi, r8–r11. The callee may overwrite them; the <b>caller</b> saves them if needed after the call.'],
    [/align/i, 'Alignment', 'Stack: rsp must be a multiple of 16 just before <code>call</code>; on function entry rsp ≡ 8 (mod 16). Data: a type sits at an address divisible by its size (int → 4).'],
    [/frame pointer|%rbp|prologue/i, 'Frame pointer', '<code>pushq %rbp; movq %rsp,%rbp</code>: rbp becomes a fixed reference. 0(%rbp) = saved rbp, 8(%rbp) = return address, locals at negative offsets.'],
    [/\bABI\b|System V/i, 'System V ABI', 'Linux calling convention: args rdi, rsi, rdx, rcx, r8, r9; return in rax; callee/caller-saved rules; 16-byte stack alignment.'],
    [/\bcmp\b|compar/i, 'cmp', '<code>cmp a, b</code> computes <b>b − a</b> and only sets flags. Read the following jump as "b ? a".'],
    [/\btest\b/i, 'test', 'Bitwise AND that only sets flags. <code>test r, r</code> → ZF = 1 when r is 0.'],
    [/\bja\b|\bjb\b|\bjae\b|\bjbe\b|\bseta|\bsetb|cmova|cmovb|unsigned/i, 'Above / Below', '<b>a</b>bove / <b>b</b>elow = <b>unsigned</b> comparisons (ja, jae, jb, jbe, seta, cmovb…).'],
    [/\bjg\b|\bjl\b|\bjge\b|\bjle\b|\bsetg|\bsetl|cmovg|cmovl|\bsigned/i, 'Greater / Less', '<b>g</b>reater / <b>l</b>ess = <b>signed</b> comparisons (jg, jge, jl, jle, setl, cmovg…).'],
    [/\bje\b|\bjne\b|\bjmp\b/i, 'je / jne / jmp', 'je = jump if equal (ZF = 1); jne = jump if not equal; jmp = always jump (ignores flags).'],
    [/\bset(e|ne|g|ge|l|le|a|ae|b|be)\b/i, 'setX', 'Writes 1 or 0 into an <b>8-bit</b> register/memory byte depending on the flags.'],
    [/cmov|conditional move/i, 'Conditional move', '<code>cmovX src, dst</code> copies only if the condition is true. Both values are computed first, no jump → no misprediction. Good for cheap, unpredictable choices.'],
    [/\bsal\b|shift.*left|left.*shift/i, 'sal', 'Shift Arithmetic Left: ×2 per bit, zeros come in on the right.'],
    [/\bsar\b|arithmetic right/i, 'sar', 'Shift Arithmetic Right: ÷2 per bit (floor), the sign bit is copied in on the left.'],
    [/\bXOR\b/, 'XOR', '1 where bits differ. Toggles bits; x ^ x = 0; x ^ 0xFF flips a byte.'],
    [/\bOR\b/, 'OR', '1 if either bit is 1. Used to force bits to 1.'],
    [/\bAND\b/, 'AND', '1 only if both bits are 1. Used to mask/keep bits (x & 0xFF keeps the low byte).'],
    [/\bNOT\b|\bnotb\b/, 'NOT', 'Flips every bit (0↔1).'],
    [/\bmask/i, 'Mask', 'A bit pattern with 1s in the positions you care about. Bit 0 is the rightmost (LSB).'],
    [/branch predict|mispredict/i, 'Branch prediction', 'The CPU guesses which way a branch goes and keeps fetching. Wrong guess → flush the wrongly fetched work (penalty).'],
    [/row-major|flattened/i, 'Row-major', '2D arrays are stored row by row: k = i·c + j, row = k / c, col = k % c.'],
    [/padding/i, 'Padding', 'Unused bytes the compiler inserts so the next member is aligned. Put larger members first to reduce it.'],
    [/spatial locality/i, 'Spatial locality', 'Accessing nearby addresses together (e.g. a[i], a[i+1]) — uses the whole 64 B cache line.'],
    [/temporal locality/i, 'Temporal locality', 'Re-using the same address soon after.'],
    [/unroll/i, 'Loop unrolling', 'Do several elements per iteration (with several accumulators): less loop overhead, broken dependency chain → higher IPC (ILP).'],
    [/SIMD|SSE2|XMM/i, 'SIMD', '<b>S</b>ingle <b>I</b>nstruction <b>M</b>ultiple <b>D</b>ata: one instruction works on a vector (SSE2 XMM = 128-bit = 4 ints). Fewer instructions & cycles.'],
    [/thread|pthread/i, 'Threads', 'pthread_create starts a worker; pthread_join waits for it. Threads = thread-level parallelism across cores.'],
    [/race/i, 'Race condition', 'Result depends on timing because threads read-modify-write shared data (i++). Fix with a mutex.'],
    [/mutex|deadlock/i, 'Mutex', 'Lock before touching shared data, unlock after. Never unlocking → deadlock (others wait forever).'],
    [/\bIPC\b|per cycle/i, 'IPC', 'Instructions Per Cycle = instructions ÷ cycles. Higher = more instruction-level parallelism.'],
    [/task-clock/i, 'task-clock', 'CPU time used by the program. Larger than elapsed time ⇒ several CPUs worked at once.'],
    [/context.?switch|migration/i, 'Context switch / migration', 'Scheduler swapping tasks / moving a thread to another core. Jumps up with threading.'],
    [/\bperf\b/i, 'perf', 'Linux profiler using hardware counters: instructions, cycles, branches, branch-misses, cache misses…'],
    [/pipelin|stage/i, 'Pipeline', 'F fetch · D decode · E execute · M memory · W write-back. N instructions, k stages → N + k − 1 cycles; max speedup k.'],
    [/latency/i, 'Latency', 'Time for ONE instruction to go through all stages (k × stage time). Pipelining doesn\'t shorten it.'],
    [/throughput/i, 'Throughput', 'Work completed per unit time (IPC). Pipelining raises it.'],
    [/\bRAW\b|read after write/i, 'RAW', 'Read After Write — a <b>true</b> dependency: an instruction needs a value an earlier one hasn\'t written yet.'],
    [/\bWAR\b|write after read/i, 'WAR', 'Write After Read — false dependency: a later instruction overwrites a register before an earlier one has read the old value (only with out-of-order).'],
    [/\bWAW\b|write after write/i, 'WAW', 'Write After Write — two writes to the same register land in the wrong order.'],
    [/forward/i, 'Forwarding', 'Sending a result straight from one stage to the next instruction\'s E stage, skipping the wait for W. Can\'t fully fix load-use.'],
    [/load-use/i, 'Load-use', 'An instruction needs a value being loaded from memory; it\'s only ready after M → 1 stall even with forwarding.'],
    [/structural/i, 'Structural hazard', 'Two instructions need the same hardware in the same cycle (one memory unit, one multiplier).'],
    [/control hazard/i, 'Control hazard', 'At a branch the CPU doesn\'t yet know which instruction to fetch next.'],
    [/out-of-order|\bOoO\b/i, 'Out-of-order', 'The CPU runs a later independent instruction early to fill a stall; results still commit in order.'],
    [/renam|physical register/i, 'Register renaming', 'Maps architectural registers (rax…) to hidden physical ones (P0, P1…) → removes WAR and WAW, not RAW.'],
    [/superscalar|issue|four-wide|retire/i, 'Superscalar', 'Can issue/retire several instructions per cycle (N-wide → max IPC N) using multiple functional units.'],
    [/reorder buffer|\bROB\b/i, 'Reorder buffer', 'Holds out-of-order results and commits them in program order.'],
    [/reservation station/i, 'Reservation station', 'Where instructions wait until their operands are ready.'],
    [/cache line|\bblock\b/i, 'Block / line', 'A block is a 64 B chunk of RAM; it fills one cache line. block = address / 64.'],
    [/set number|number of sets|\d+ sets|map\w* to set|\bin set \d/i, 'Set', 'set = block % number of sets. The block may only live in that set\'s 8 lines (ways).'],
    [/\btag\b/i, 'Tag', 'tag = block / number of sets. Stored with the line to identify which block it holds.'],
    [/offset/i, 'Offset', 'Byte position inside the block: address − 64 × block (= address % 64).'],
    [/compulsory|capacity|conflict/i, 'Cache misses', 'Compulsory: first access. Capacity: working set > cache. Conflict: too many blocks map to one set.'],
    [/\bLRU\b|\bFIFO\b|\bLFU\b|evict/i, 'Eviction policy', 'LRU: least recently used · FIFO: oldest · LFU: least frequently used · Random.'],
    [/working set/i, 'Working set', 'The data a program is actively using; should fit in the cache.'],
    [/tiling|tile/i, 'Tiling', 'Split a big matrix into small blocks so each block\'s working set fits in cache.'],
    [/\bijk\b|\bikj\b/i, 'Loop order', 'ijk walks B down a column (big strides, misses). ikj walks B along a row (adjacent, cache-friendly).']
  ];

  /* ---------- common distractors: why they are wrong ---------- */
  const WHY = [
    [/^None of the options$/i, 'One of the listed options <b>is</b> correct here — check it below.'],
    [/sign-extend/i, '<code>movl</code> <b>zero</b>-extends (fills the top 32 bits with 0); it never copies the sign bit.'],
    [/preserves the previous upper/i, 'Only 8- and 16-bit writes keep the other bytes. A 32-bit write always clears the upper 32 bits.'],
    [/changes only (condition )?flags/i, 'mov always writes its destination and does not change flags (that would be cmp/test).'],
    [/movq must always/i, 'Any size can write to part of rax (movl/movw/movb); they just affect different bytes.'],
    [/\b8-byte aligned\b/i, '8 bytes is not enough: the ABI demands <b>16</b>-byte alignment right before <code>call</code>. (rsp is only 8 off on function <i>entry</i>.)'],
    [/32-byte/i, 'The System V rule is 16 bytes, not 32.'],
    [/no (stack )?alignment requirement|^No requirement$|unspecified/i, 'There is a rule: rsp must be a multiple of 16 immediately before call.'],
    [/largest local variable/i, 'Alignment is fixed at 16 bytes before a call, regardless of local variable sizes.'],
    [/exactly 16-byte aligned/i, 'It was 16-aligned <i>before</i> the call; call pushed 8 bytes, so on entry it is 8 off.'],
    [/after dereferencing|value stored at|stored at address|loads 8 bytes from memory|reads? memory/i, 'That describes reading memory (like <code>movq (…)</code>). <code>lea</code> only computes the address number.'],
    [/nothing because %r12 is caller-saved|is caller-saved/i, 'r12 (and rbx, rbp, r13–r15) are <b>callee</b>-saved — the function that uses them must restore them.'],
    [/assume the callee preserves/i, 'r10 is caller-saved: a callee may freely overwrite it, so the caller must save it.'],
    [/move %r10 into %r15 after/i, 'After the call it is too late — r10 may already be overwritten. Save it <b>before</b> the call.'],
    [/negative offsets from %rbp/i, 'Negative offsets are for <b>locals</b>. Stack-passed arguments are above the return address: positive offsets (16(%rbp)…).'],
    [/-8\(%rbp\)|8\(%rbp\)|16\(%rbp\)/, 'After the prologue: 0(%rbp) = saved rbp, 8(%rbp) = return address, 16(%rbp) = first stack argument, −N(%rbp) = locals.'],
    [/ret followed by leave/i, 'ret jumps away, so leave would never run. Order is leave, then ret.'],
    [/WAR dependency/i, 'WAR = write after read (a false dependency). Here the 2nd instruction <b>reads</b> what the 1st <b>writes</b> → that is RAW.'],
    [/needs the new value produced by I2/i, 'That would be RAW. In WAR, I1 needs the <b>old</b> value but I2 overwrites it first.'],
    [/eliminate true RAW/i, 'RAW is a true dependency — no renaming can remove it. Renaming removes WAR and WAW.'],
    [/increase the number of architectural registers|add architectural registers/i, 'Programmers still see the same registers; renaming uses hidden <b>physical</b> registers.'],
    [/makes? each stage (execute )?faster/i, 'Each stage takes the same time; pipelining overlaps instructions to raise throughput.'],
    [/reduces? (the )?(instruction count|number of instructions|program size)/i, 'Pipelining runs the same instructions — it overlaps them; it doesn\'t remove any.'],
    [/eliminates? (all )?hazards/i, 'Pipelines still suffer data, control and structural hazards.'],
    [/Latency is (2|5) ns/i, 'Latency = number of stages × stage time = 5 × 2 ns = 10 ns.'],
    [/one every 10 ns/i, 'Once the pipeline is full, one instruction finishes every cycle = every 2 ns.'],
    [/^Branch prediction$/i, 'Branch prediction handles <b>control</b> hazards, not two stages fighting over hardware.'],
    [/^Register renaming$/i, 'Renaming removes WAR/WAW false dependencies; it adds no memory ports.'],
    [/^Loop unrolling$/i, 'Unrolling is a software ILP trick; it doesn\'t add hardware.'],
    [/Temporal locality/i, 'Temporal = the <b>same</b> address used again soon. Nearby addresses = spatial.'],
    [/Compulsory miss|Cold-start/i, 'Compulsory = the very first access to a block, not a full or crowded cache.'],
    [/^Capacity miss$/i, 'Capacity = the working set is bigger than the whole cache.'],
    [/^Conflict miss$/i, 'Conflict = enough space overall but too many blocks map to the same set.'],
    [/^LRU$/, 'LRU evicts the line unused for the longest time.'], [/^FIFO$/, 'FIFO evicts the oldest line brought in.'], [/^LFU$/, 'LFU evicts the least frequently used line.'],
    [/^Unrolled$/i, 'Unrolling keeps instruction count similar but raises IPC and cuts branches.'],
    [/^SIMD$/i, 'SIMD roughly divides instructions and branches (several elements per instruction) and cuts cycles.'],
    [/^Threaded$/i, 'Threading shows huge context-switches and cpu-migrations, IPC about the same.'],
    [/^None \(/i, 'The stats do differ significantly — look at IPC, instruction count, context-switches.'],
    [/higher context-switch|more CPU migrations/i, 'Context switches / migrations are signs of threading, not SIMD.'],
    [/^(cycles|branches|cache-misses|branch-misses) divided|cycles divided by instructions/i, 'IPC = instructions ÷ cycles (that\'s CPI upside down otherwise).'],
    [/jl only tests equality|ja only works with equality/i, 'Equality is je/jne. jl/jg are signed order tests; ja/jb unsigned.'],
    [/is identical to/i, 'They differ: g/l are signed, a/b are unsigned.'],
    [/ignores the comparison|always jumps/i, 'Only jmp ignores flags; conditional jumps read the flags set by cmp.'],
    [/both paths must always execute/i, 'That describes cmov (both computed). A branch runs only one path.'],
    [/both results are cheap and predictions are random|both possible results are cheap/i, 'That is when <b>cmov</b> wins, not branching.'],
    [/predictor is almost always correct/i, 'If the branch is predictable, branching is fine — cmov is for unpredictable conditions.'],
    [/only one (candidate )?result/i, 'cmov computes both results; it suits cases where both are cheap.'],
    [/k = i\*j|k = i \+ j|k = i\*c - j|k = i \+ j\*c\*c/i, 'Row-major: skip i whole rows of c elements, then j more → k = i·c + j.'],
    [/^k \/ c$/i, 'k / c gives the <b>row</b>; the column is k % c.'],
    [/sorted (by size|largest)|alphabetical|by initial value/i, 'C never reorders struct members; they stay in declaration order (with padding).'],
    [/smaller (members )?before larger/i, 'Small-then-large creates padding before each big member. Large first minimises it.'],
    [/^(102|106|110)$/, 'An int needs an address divisible by 4.'],
    [/pthread_(wait|exit)|mutex_lock/i, 'pthread_create starts a thread; pthread_join waits for it; mutex_lock is for locking shared data.'],
    [/To unlock a mutex|create another worker|allocate stack/i, 'pthread_join just <b>waits</b> for the worker thread to finish.'],
    [/requires SIMD|branch miss|cannot be compiled/i, 'The race comes from the read-modify-write of shared data, not instructions or branches.'],
    [/Context switches|CPU migrations|Cache miss rate|Task clock/i, 'For ILP the key metric is IPC (instructions per cycle).'],
    [/Single Input|Sequential Instruction|Managed Data/i, 'SIMD = Single Instruction, Multiple Data.'],
    [/Unconditional move|Arithmetic shift|Bitwise NOT|Function call/i, 'Selecting between two values without a jump is a conditional move (cmov).'],
    [/Instruction 1 is flushed|restarts|simultaneously|skips its fetch/i, 'With one memory unit, the later instruction (I4\'s fetch) simply waits a cycle — a structural stall.'],
    [/Two instructions need the same ALU|cache is full|multiple registers/i, 'A control hazard is about not knowing the next instruction after a branch.'],
    [/^A value has not been written yet$/i, 'That is a data (RAW) hazard, not a control hazard.']
  ];
  function why(text) { const t = strip(text); for (const [re, msg] of WHY) if (re.test(t)) return msg; return null; }

  function terms(text, max) {
    const t = strip(text), seen = new Set(), out = [];
    // registers first
    (t.match(/%[a-z0-9]+/gi) || []).forEach((r) => { const k = r.toLowerCase(); if (seen.has(k)) return; const info = reg(k); if (info) { seen.add(k); out.push(['%' + info.name, info.text.replace(/^<code>[^<]+<\/code> — /, '')]); } });
    G.forEach(([re, name, def]) => { if (re.test(t) && !seen.has(name)) { seen.add(name); out.push([name, def]); } });
    return out.slice(0, max || 8);
  }

  function describe(text) {
    const d = instr(text);
    if (d) return d;
    const ts = terms(text, 2).filter((x) => !x[0].startsWith('%'));
    if (ts.length) return `“${strip(text)}” — ` + ts.map((x) => `<b>${x[0]}</b>: ${x[1]}`).join(' ');
    return null;
  }

  function panel(q, chosen) {
    const wrong = chosen != null && chosen !== q.ans;
    let html = '';
    if (wrong) {
      const w = why(chosen), dc = describe(chosen), da = describe(q.ans);
      const numeric = /^[-+]?[\d.,\/ ]+(ns|cycles|×)?$|^0x[0-9a-f]+$|^[01]{8}$|^[01 ]+\(?-?\d*\)?$/i.test(strip(chosen));
      html += `<div class="teach"><h4>Why not your answer?</h4>`;
      if (w) html += `<p>${w}</p>`;
      if (dc) html += `<p>${dc}</p>`;
      if (!w && !dc) html += numeric
        ? `<p>${esc(strip(chosen))} is not the result — redo the working: ${q.exp || 'see the notes for the formula.'}</p>`
        : `<p>“${esc(strip(chosen))}” is a distractor. The key fact: ${q.exp || 'see the correct answer and the notes.'}</p>`;
      if (da) html += `<h4>What the correct answer means</h4><p>${da}</p>`;
      html += `</div>`;
    } else {
      const da = instr(q.ans); if (da) html += `<div class="teach"><h4>What it means</h4><p>${da}</p></div>`;
    }
    const ts = terms(q.text + ' ' + q.ans + ' ' + (chosen || ''), 7);
    if (ts.length) html += `<details class="terms" ${wrong ? 'open' : ''}><summary>Key terms (${ts.length})</summary><dl>${ts.map((x) => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('')}</dl></details>`;
    return html;
  }

  return { panel, instr, terms };
})();
