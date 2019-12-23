
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/pages/home.svelte generated by Svelte v3.16.5 */

    const file = "src/pages/home.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let h1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "HOME";
    			add_location(h1, file, 5, 4, 51);
    			attr_dev(div, "class", "intro svelte-1o3dbmk");
    			add_location(div, file, 4, 0, 27);
    			attr_dev(main, "class", "svelte-1o3dbmk");
    			add_location(main, file, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/pages/about.svelte generated by Svelte v3.16.5 */

    const file$1 = "src/pages/about.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let h2;
    	let t2;
    	let span0;
    	let t4;
    	let span1;
    	let t6;
    	let div1;
    	let p0;
    	let t7;
    	let br0;
    	let br1;
    	let t8;
    	let t9;
    	let p1;
    	let t10;
    	let br2;
    	let br3;
    	let t11;
    	let a0;
    	let t13;
    	let a1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "ABOUT";
    			t1 = space();
    			div2 = element("div");
    			h2 = element("h2");
    			t2 = text("Ellie creates ");
    			span0 = element("span");
    			span0.textContent = "interactive visualizations";
    			t4 = text(" to give viewers a deeper understanding of ");
    			span1 = element("span");
    			span1.textContent = "complex ideas.";
    			t6 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t7 = text("As a graduate of Data Visualization at Parsons School of Design, Ellie is building upon her lifelong passion for numbers, patterns, and art. \n      ");
    			br0 = element("br");
    			br1 = element("br");
    			t8 = text("\n      She graduated from Villanova University in 2013 with a degree in mathematics and a minor in business, then went on to spend 4 years with Deloitte Consulting, working in the technology and analytics practice.");
    			t9 = space();
    			p1 = element("p");
    			t10 = text("At Parsons, she learned valuable design concepts for static and graphic visualizations. She is well versed in HTML, CSS, R, Python, and JavaScript (including libraries D3.js and p5). \n      ");
    			br2 = element("br");
    			br3 = element("br");
    			t11 = text("\n      She currently works as a developer at ");
    			a0 = element("a");
    			a0.textContent = "Two-N";
    			t13 = text(", an award winning data visualization agency in New York. She can be reached at ");
    			a1 = element("a");
    			a1.textContent = "elliefrymire@gmail.com.";
    			add_location(h1, file$1, 6, 4, 54);
    			attr_dev(div0, "class", "intro svelte-rl03e0");
    			add_location(div0, file$1, 5, 2, 30);
    			attr_dev(span0, "class", "emphasis svelte-rl03e0");
    			add_location(span0, file$1, 9, 22, 121);
    			attr_dev(span1, "class", "emphasis svelte-rl03e0");
    			add_location(span1, file$1, 9, 121, 220);
    			add_location(h2, file$1, 9, 4, 103);
    			add_location(br0, file$1, 13, 6, 496);
    			add_location(br1, file$1, 13, 11, 501);
    			attr_dev(p0, "class", "column about-text-column svelte-rl03e0");
    			add_location(p0, file$1, 11, 6, 305);
    			add_location(br2, file$1, 18, 6, 972);
    			add_location(br3, file$1, 18, 11, 977);
    			attr_dev(a0, "href", "http://two-n.com/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$1, 19, 44, 1027);
    			attr_dev(a1, "href", "mailto:elliefrymire@gmail.com");
    			add_location(a1, file$1, 19, 177, 1160);
    			attr_dev(p1, "class", "column about-text-column svelte-rl03e0");
    			add_location(p1, file$1, 16, 6, 739);
    			attr_dev(div1, "class", "about-text svelte-rl03e0");
    			add_location(div1, file$1, 10, 4, 274);
    			attr_dev(div2, "class", "About svelte-rl03e0");
    			add_location(div2, file$1, 8, 1, 79);
    			attr_dev(main, "class", "svelte-rl03e0");
    			add_location(main, file$1, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h1);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, h2);
    			append_dev(h2, t2);
    			append_dev(h2, span0);
    			append_dev(h2, t4);
    			append_dev(h2, span1);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t7);
    			append_dev(p0, br0);
    			append_dev(p0, br1);
    			append_dev(p0, t8);
    			append_dev(div1, t9);
    			append_dev(div1, p1);
    			append_dev(p1, t10);
    			append_dev(p1, br2);
    			append_dev(p1, br3);
    			append_dev(p1, t11);
    			append_dev(p1, a0);
    			append_dev(p1, t13);
    			append_dev(p1, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/pages/work.svelte generated by Svelte v3.16.5 */

    const file$2 = "src/pages/work.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (73:5) {#each item.buttons as button}
    function create_each_block_1(ctx) {
    	let span;
    	let t_value = /*button*/ ctx[5].text + "";
    	let t;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[1](/*button*/ ctx[5], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "button svelte-9e8iq");
    			add_location(span, file$2, 73, 6, 4037);
    			dispose = listen_dev(span, "click", click_handler, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(73:5) {#each item.buttons as button}",
    		ctx
    	});

    	return block;
    }

    // (67:2) {#each workItems as item}
    function create_each_block(ctx) {
    	let div1;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div0;
    	let h3;
    	let t1_value = /*item*/ ctx[2].heading + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*item*/ ctx[2].details + "";
    	let t3;
    	let t4;
    	let div0_class_value;
    	let t5;
    	let div1_class_value;
    	let each_value_1 = /*item*/ ctx[2].buttons;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty("work-item-img") + " svelte-9e8iq"));
    			if (img.src !== (img_src_value = /*item*/ ctx[2].image.src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[2].image.alt);
    			add_location(img, file$2, 68, 4, 3792);
    			attr_dev(h3, "class", "heading svelte-9e8iq");
    			add_location(h3, file$2, 70, 5, 3912);
    			attr_dev(p, "class", "details");
    			add_location(p, file$2, 71, 5, 3957);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty("work-item-details") + " svelte-9e8iq"));
    			add_location(div0, file$2, 69, 4, 3871);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty("work-item") + " svelte-9e8iq"));
    			add_location(div1, file$2, 67, 3, 3760);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(div0, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*handleClick, workItems*/ 1) {
    				each_value_1 = /*item*/ ctx[2].buttons;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(67:2) {#each workItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let a0;
    	let t4;
    	let a1;
    	let t6;
    	let each_value = /*workItems*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "WORK";
    			t1 = space();
    			p = element("p");
    			t2 = text("The following are just a few examples of Ellie's work during her time at Parson's School of Design. She currently works at ");
    			a0 = element("a");
    			a0.textContent = "Two-N";
    			t4 = text(", a data visualization studio in chinatown, and contributes to ");
    			a1 = element("a");
    			a1.textContent = "their projects.";
    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$2, 62, 3, 3384);
    			attr_dev(a0, "href", "http://two-n.com/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$2, 63, 129, 3527);
    			attr_dev(a1, "href", "http://two-n.com/projects");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$2, 63, 245, 3643);
    			add_location(p, file$2, 63, 3, 3401);
    			attr_dev(div0, "class", "intro svelte-9e8iq");
    			add_location(div0, file$2, 61, 2, 3361);
    			attr_dev(div1, "class", "Work");
    			add_location(div1, file$2, 59, 1, 3339);
    			attr_dev(main, "class", "svelte-9e8iq");
    			add_location(main, file$2, 58, 0, 3331);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(p, t2);
    			append_dev(p, a0);
    			append_dev(p, t4);
    			append_dev(p, a1);
    			append_dev(div1, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*workItems, handleClick*/ 1) {
    				each_value = /*workItems*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleClick(url) {
    	window.open(url, "_blank");
    }

    function instance($$self) {
    	const workItems = [
    		{
    			heading: "#metoo: Clusters of Tweets",
    			details: "For my final thesis, I scraped nearly 1.4 million tweets from the public twitter search page to analyze the language within. Using kmeans cluster analysis, I find themes in the tweets and seek to answer the question: \"what are people really saying about #metoo?\" This thesis took me all over the world — I spoke about it at Antenna during Dutch Design Week, the Design Indaba Conference in Cape Town, as a lightning talk at Eyeo Festival in Minneapolis, and as a d3.js meet up talk.",
    			image: { src: "assets/metoo.png", alt: "image" },
    			buttons: [
    				{
    					text: "explore clusters",
    					url: "https://efrymire.github.io/thesis/index.html"
    				},
    				{
    					text: "watch the video",
    					url: "https://www.youtube.com/watch?v=0xd5JNASIE4&feature=youtu.be"
    				}
    			]
    		},
    		{
    			heading: "The 162 Sailing Stones of Death Valley",
    			details: "In 1993, Dr. Paula Messina carefully recorded the movements of 162 of these stones in death valley over a period of 3 months. This 40x40 poster visualized the journey of each stone, aggregating these movements for an interesting comparison of direction and distance, as if they all originated from a single start point. ",
    			image: {
    				src: "assets/sailingstones.png",
    				alt: "image"
    			},
    			buttons: [
    				{
    					text: "learn more",
    					url: "https://efrymire.github.io/portfolio/sailingstones.html"
    				}
    			]
    		},
    		{
    			heading: "Ice Cream Turf Wars",
    			details: "The infamous \"ice cream turf wars\" between Mister Softee and New York Ice Cream Company have played out over almost a decade in this big city playground. This 40x40 poster details this story through excerpts from news sources throughout the years, and as each company developed their own identity.",
    			image: { src: "assets/icecream.png", alt: "image" },
    			buttons: [
    				{
    					text: "check it out",
    					url: "https://efrymire.github.io/portfolio/icecream.html"
    				}
    			]
    		},
    		{
    			heading: "Exploring Equality: Visualizing the relationship between gender inequality and income inequality",
    			details: "This visualization was designed to illustrate clear relationships between gender and income inequality, while simultaneously educating the user on the process of calculating male and female indexes in relation to income inequality. By understanding the impact of gender equality on income equality, and the striking difference in male and female indexes based on country, we can work to raise female indexes, thus lowering gender and income inequality.",
    			image: { src: "assets/undp.png", alt: "image" },
    			buttons: [{ text: "play with it", url: "" }]
    		}
    	];

    	const click_handler = button => handleClick(button.url);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [workItems, click_handler];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.5 */
    const file$3 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (41:2) {#each pages as page}
    function create_each_block$1(ctx) {
    	let span;
    	let t_value = /*page*/ ctx[0].name + "";
    	let t;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[5](/*page*/ ctx[0], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-1k2bujr");
    			toggle_class(span, "active", /*active*/ ctx[1].name === /*page*/ ctx[0].name);
    			add_location(span, file$3, 41, 3, 1038);
    			dispose = listen_dev(span, "click", click_handler_1, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*active, pages*/ 6) {
    				toggle_class(span, "active", /*active*/ ctx[1].name === /*page*/ ctx[0].name);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(41:2) {#each pages as page}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let div2;
    	let h1;
    	let t2;
    	let div1;
    	let current;
    	let dispose;
    	var switch_value = /*active*/ ctx[1].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	let each_value = /*pages*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Ellie Frymire";
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "page svelte-1k2bujr");
    			add_location(div0, file$3, 34, 1, 825);
    			add_location(h1, file$3, 38, 2, 922);
    			attr_dev(div1, "class", "navigation svelte-1k2bujr");
    			add_location(div1, file$3, 39, 2, 986);
    			attr_dev(div2, "class", "footer svelte-1k2bujr");
    			add_location(div2, file$3, 37, 1, 899);
    			attr_dev(main, "class", "svelte-1k2bujr");
    			add_location(main, file$3, 33, 0, 817);
    			dispose = listen_dev(h1, "click", /*click_handler*/ ctx[4], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			append_dev(main, t0);
    			append_dev(main, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*active*/ ctx[1].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (dirty & /*active, pages, handleClick*/ 14) {
    				each_value = /*pages*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { page } = $$props;

    	const pages = [
    		{
    			name: "home",
    			component: Home,
    			link: null
    		},
    		{
    			name: "about",
    			component: About,
    			link: null
    		},
    		{
    			name: "work",
    			component: Work,
    			link: null
    		},
    		{
    			name: "github",
    			component: null,
    			link: "https://github.com/efrymire"
    		},
    		{
    			name: "resume",
    			component: null,
    			link: "https://drive.google.com/file/d/19N6Coaf4pHDEgD-uCZ-2iq3PyD20Nc3z/view?usp=sharing"
    		}
    	];

    	let active = pages[0];

    	function handleClick(newPage) {
    		if (newPage.component) {
    			$$invalidate(0, page = newPage.name);
    			$$invalidate(1, active = newPage);
    		}

    		if (newPage.link) {
    			window.open(newPage.link.toString(), "_blank");
    		}
    	}

    	const writable_props = ["page"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClick(pages[0]);
    	const click_handler_1 = page => handleClick(page);

    	$$self.$set = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    	};

    	$$self.$capture_state = () => {
    		return { page, active };
    	};

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    	};

    	return [page, active, pages, handleClick, click_handler, click_handler_1];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$3, safe_not_equal, { page: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*page*/ ctx[0] === undefined && !("page" in props)) {
    			console.warn("<App> was created without expected prop 'page'");
    		}
    	}

    	get page() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		page: 'home',
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
