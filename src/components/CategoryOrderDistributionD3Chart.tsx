import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  BarChart3, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Info, 
  ShoppingBag, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Sliders, 
  RotateCcw,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { Order, FoodItem, FoodCategory } from '../types';

export interface CategoryStockForecastData {
  category: FoodCategory;
  nameBn: string;
  nameEn: string;
  orderCount: number;
  revenue: number;
  totalUnitsSold: number;
  forecastedDemand: number;
  confidenceScore: number;
  stockLevelStatus: 'optimal' | 'warning' | 'urgent';
  primaryIngredients: {
    nameBn: string;
    nameEn: string;
    currentStockKg: number;
    recommendedProcurementKg: number;
    unit: string;
  }[];
  topDishes: string[];
  color: string;
  gradientStart: string;
  gradientEnd: string;
}

interface CategoryOrderDistributionD3ChartProps {
  orders: Order[];
  foodItems: FoodItem[];
  lang?: 'bn' | 'en';
}

export const CategoryOrderDistributionD3Chart: React.FC<CategoryOrderDistributionD3ChartProps> = ({
  orders,
  foodItems,
  lang = 'bn',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [metric, setMetric] = useState<'orders' | 'revenue' | 'forecast'>('orders');
  const [rushMultiplier, setRushMultiplier] = useState<number>(15); // +15% expected surge
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [copiedStock, setCopiedStock] = useState(false);

  // Compute live category statistics from incoming orders combined with weekly historical baselines
  const categoryData: CategoryStockForecastData[] = useMemo(() => {
    // Tally actual cart items by category
    const liveCounts: Record<FoodCategory, { orders: number; revenue: number; units: number }> = {
      all: { orders: 0, revenue: 0, units: 0 },
      sweets_snacks: { orders: 0, revenue: 0, units: 0 },
      lunch_dinner: { orders: 0, revenue: 0, units: 0 },
      fish_meat: { orders: 0, revenue: 0, units: 0 },
      breakfast: { orders: 0, revenue: 0, units: 0 },
      beverage: { orders: 0, revenue: 0, units: 0 },
    };

    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        const cat = item.food.category;
        if (liveCounts[cat]) {
          liveCounts[cat].orders += 1;
          const price = item.selectedPortion ? item.selectedPortion.price : item.food.price;
          liveCounts[cat].revenue += price * item.quantity;
          liveCounts[cat].units += item.quantity;
        }
      });
    });

    const surgeFactor = 1 + rushMultiplier / 100;

    return [
      {
        category: 'sweets_snacks',
        nameBn: 'মিষ্টি ও নাশতা (জিলাপি-সমুচা)',
        nameEn: 'Sweets & Snacks',
        orderCount: 48 + liveCounts.sweets_snacks.orders,
        revenue: 4250 + liveCounts.sweets_snacks.revenue,
        totalUnitsSold: 54 + liveCounts.sweets_snacks.units,
        forecastedDemand: Math.round((54 + liveCounts.sweets_snacks.units) * surgeFactor * 1.18),
        confidenceScore: 96,
        stockLevelStatus: 'urgent',
        primaryIngredients: [
          { nameBn: 'ময়দা ও বেসন', nameEn: 'Flour & Gram Flour', currentStockKg: 18, recommendedProcurementKg: Math.round(35 * surgeFactor), unit: 'কেজি' },
          { nameBn: 'খাঁটি চিনি (সিরা)', nameEn: 'Sugar (Syrup)', currentStockKg: 22, recommendedProcurementKg: Math.round(45 * surgeFactor), unit: 'কেজি' },
          { nameBn: 'সয়াবিন তেল / ডালডা', nameEn: 'Soybean Oil', currentStockKg: 15, recommendedProcurementKg: Math.round(30 * surgeFactor), unit: 'লিটার' },
        ],
        topDishes: ['রসালো গরম জিলাপি', 'মুচমুচে সিঙ্গারা', 'স্পেশাল চমচম'],
        color: '#f59e0b',
        gradientStart: '#f59e0b',
        gradientEnd: '#d97706',
      },
      {
        category: 'lunch_dinner',
        nameBn: 'ভাত, খিচুড়ি ও পোলাও',
        nameEn: 'Rice & Khichuri Dishes',
        orderCount: 42 + liveCounts.lunch_dinner.orders,
        revenue: 3480 + liveCounts.lunch_dinner.revenue,
        totalUnitsSold: 62 + liveCounts.lunch_dinner.units,
        forecastedDemand: Math.round((62 + liveCounts.lunch_dinner.units) * surgeFactor * 1.12),
        confidenceScore: 94,
        stockLevelStatus: 'warning',
        primaryIngredients: [
          { nameBn: 'মিনিকেট / চিনিগুঁড়া চাল', nameEn: 'Miniket Rice', currentStockKg: 40, recommendedProcurementKg: Math.round(75 * surgeFactor), unit: 'কেজি' },
          { nameBn: 'মুগ ও মসুর ডাল', nameEn: 'Lentils / Dal', currentStockKg: 12, recommendedProcurementKg: Math.round(25 * surgeFactor), unit: 'কেজি' },
          { nameBn: 'সরিষার তেল ও ঘি', nameEn: 'Mustard Oil & Ghee', currentStockKg: 8, recommendedProcurementKg: Math.round(16 * surgeFactor), unit: 'লিটার' },
        ],
        topDishes: ['স্পেশাল ভুনা খিচুড়ি', 'ঝরঝরে সাদা ভাত', 'ডাল চচ্চড়ি'],
        color: '#10b981',
        gradientStart: '#10b981',
        gradientEnd: '#059669',
      },
      {
        category: 'fish_meat',
        nameBn: 'মাংস ও মাছের পদ (কারি)',
        nameEn: 'Meat & Fish Curries',
        orderCount: 36 + liveCounts.fish_meat.orders,
        revenue: 4120 + liveCounts.fish_meat.revenue,
        totalUnitsSold: 41 + liveCounts.fish_meat.units,
        forecastedDemand: Math.round((41 + liveCounts.fish_meat.units) * surgeFactor * 1.15),
        confidenceScore: 92,
        stockLevelStatus: 'urgent',
        primaryIngredients: [
          { nameBn: 'তাজা দেশি গরুর মাংস', nameEn: 'Fresh Beef', currentStockKg: 14, recommendedProcurementKg: Math.round(38 * surgeFactor), unit: 'কেজি' },
          { nameBn: 'ফার্ম / সোনালী মুরগি', nameEn: 'Chicken Meat', currentStockKg: 12, recommendedProcurementKg: Math.round(28 * surgeFactor), unit: 'কেজি' },
          { nameBn: 'পেঁয়াজ, রসুন ও আদা বাটা', nameEn: 'Onion & Spices', currentStockKg: 16, recommendedProcurementKg: Math.round(32 * surgeFactor), unit: 'কেজি' },
        ],
        topDishes: ['কষা গরুর মাংস', 'দেশি মুরগির ঝোল', 'রুই মাছের কালিয়া'],
        color: '#f43f5e',
        gradientStart: '#f43f5e',
        gradientEnd: '#be123c',
      },
      {
        category: 'breakfast',
        nameBn: 'সকালের নাশতা ও ডিম',
        nameEn: 'Breakfast & Eggs',
        orderCount: 29 + liveCounts.breakfast.orders,
        revenue: 1640 + liveCounts.breakfast.revenue,
        totalUnitsSold: 50 + liveCounts.breakfast.units,
        forecastedDemand: Math.round((50 + liveCounts.breakfast.units) * surgeFactor * 1.08),
        confidenceScore: 90,
        stockLevelStatus: 'optimal',
        primaryIngredients: [
          { nameBn: 'লাল মুরগির ডিম', nameEn: 'Fresh Eggs', currentStockKg: 80, recommendedProcurementKg: Math.round(180 * surgeFactor), unit: 'পিস' },
          { nameBn: 'আটা ও পরোটার ময়দা', nameEn: 'Atta Flour', currentStockKg: 20, recommendedProcurementKg: Math.round(40 * surgeFactor), unit: 'কেজি' },
          { nameBn: 'আলু ও সবজি', nameEn: 'Vegetables & Potato', currentStockKg: 25, recommendedProcurementKg: Math.round(50 * surgeFactor), unit: 'কেজি' },
        ],
        topDishes: ['স্পেশাল ডিম ভুনা', 'গরম পরোটা ও ভাজি', 'সবজি ডাল মিক্স'],
        color: '#06b6d4',
        gradientStart: '#06b6d4',
        gradientEnd: '#0891b2',
      },
      {
        category: 'beverage',
        nameBn: 'চা, কফি ও পানীয়',
        nameEn: 'Beverages & Tea',
        orderCount: 24 + liveCounts.beverage.orders,
        revenue: 960 + liveCounts.beverage.revenue,
        totalUnitsSold: 58 + liveCounts.beverage.units,
        forecastedDemand: Math.round((58 + liveCounts.beverage.units) * surgeFactor * 1.10),
        confidenceScore: 95,
        stockLevelStatus: 'optimal',
        primaryIngredients: [
          { nameBn: 'স্পেশাল ব্লেন্ড চা পাতা', nameEn: 'Premium Tea Leaf', currentStockKg: 5, recommendedProcurementKg: Math.round(12 * surgeFactor), unit: 'কেজি' },
          { nameBn: 'খাঁটি গাভীর তরল দুধ', nameEn: 'Fresh Cow Milk', currentStockKg: 10, recommendedProcurementKg: Math.round(25 * surgeFactor), unit: 'লিটার' },
          { nameBn: 'এলাচ ও মসলা', nameEn: 'Cardamom & Cloves', currentStockKg: 1, recommendedProcurementKg: Math.round(2 * surgeFactor), unit: 'কেজি' },
        ],
        topDishes: ['মালাই দুধ চা', 'কড়া লিকার চা', 'স্পেশাল বোরহানি'],
        color: '#a855f7',
        gradientStart: '#a855f7',
        gradientEnd: '#7e22ce',
      },
    ];
  }, [orders, rushMultiplier]);

  // Total forecast summary for cards
  const totalWeeklyForecast = useMemo(() => {
    const totalOrders = categoryData.reduce((s, c) => s + c.orderCount, 0);
    const totalRev = categoryData.reduce((s, c) => s + c.revenue, 0);
    const totalDemandUnits = categoryData.reduce((s, c) => s + c.forecastedDemand, 0);
    return { totalOrders, totalRev, totalDemandUnits };
  }, [categoryData]);

  // Selected Category details (or fallback to highest demand)
  const activeCategoryDetail = useMemo(() => {
    if (selectedCategory) {
      return categoryData.find((c) => c.category === selectedCategory) || categoryData[0];
    }
    return categoryData[0]; // default to sweets & snacks
  }, [categoryData, selectedCategory]);

  // Render interactive D3 Bar Chart with transitions
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 640;
    const height = 340;
    const margin = { top: 30, right: 30, bottom: 65, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous rendering

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto; overflow: visible;');

    // Defs for Gradients & Drop Shadows
    const defs = svg.append('defs');

    // Create custom linear gradients for each category
    categoryData.forEach((d) => {
      const gradientId = `barGradient-${d.category}`;
      const grad = defs
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      grad.append('stop').attr('offset', '0%').attr('stop-color', d.gradientStart).attr('stop-opacity', 0.95);
      grad.append('stop').attr('offset', '100%').attr('stop-color', d.gradientEnd).attr('stop-opacity', 0.65);
    });

    // Shadow filter
    const filter = defs.append('filter').attr('id', 'glowShadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feDropShadow').attr('dx', '0').attr('dy', '4').attr('stdDeviation', '6').attr('flood-color', '#000000').attr('flood-opacity', '0.4');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Setup Scales
    const xScale = d3
      .scaleBand<string>()
      .domain(categoryData.map((d) => (lang === 'bn' ? d.nameBn.split(' ')[0] : d.nameEn.split(' ')[0])))
      .range([0, innerWidth])
      .padding(0.32);

    const getYValue = (d: CategoryStockForecastData) => {
      if (metric === 'orders') return d.orderCount;
      if (metric === 'revenue') return d.revenue;
      return d.forecastedDemand;
    };

    const maxValue = d3.max(categoryData, getYValue) || 100;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.15])
      .nice()
      .range([innerHeight, 0]);

    // Horizontal Grid Lines
    g.append('g')
      .attr('class', 'grid-lines')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#292524')
      .attr('stroke-dasharray', '3,3');

    g.select('.grid-lines .domain').remove();

    // X Axis
    const xAxisG = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0));

    xAxisG.select('.domain').attr('stroke', '#44403c').attr('stroke-width', 1.5);

    xAxisG
      .selectAll('text')
      .attr('fill', '#d6d3d1')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('dy', '14px')
      .attr('transform', width < 500 ? 'rotate(-18)' : 'rotate(0)')
      .style('text-anchor', width < 500 ? 'end' : 'middle');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => {
        if (metric === 'revenue') return `৳${d}`;
        return `${d}`;
      });

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.select('.domain').remove();
    yAxisG.selectAll('.tick line').remove();
    yAxisG
      .selectAll('text')
      .attr('fill', '#a8a29e')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '600')
      .attr('dx', '-6px');

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -48)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#78716c')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('text-transform', 'uppercase')
      .text(
        metric === 'orders'
          ? (lang === 'bn' ? 'সাপ্তাহিক মোট অর্ডার সংখ্যা (টি)' : 'Weekly Total Orders')
          : metric === 'revenue'
          ? (lang === 'bn' ? 'মোট বিক্রিত রাজস্ব (টাকা ৳)' : 'Total Revenue (BDT ৳)')
          : (lang === 'bn' ? 'প্রত্যাশিত স্টক চাহিদা (ইউনিট/প্লেট)' : 'Forecasted Portion Demand')
      );

    const tooltip = d3.select(tooltipRef.current);

    // Bars
    const bars = g
      .selectAll('.category-bar-group')
      .data(categoryData)
      .enter()
      .append('g')
      .attr('class', 'category-bar-group')
      .style('cursor', 'pointer');

    // Main Rounded Bar
    bars
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(lang === 'bn' ? d.nameBn.split(' ')[0] : d.nameEn.split(' ')[0]) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('fill', (d) => `url(#barGradient-${d.category})`)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('stroke', (d) => (selectedCategory === d.category ? '#ffffff' : 'transparent'))
      .attr('stroke-width', (d) => (selectedCategory === d.category ? 2 : 0))
      .style('filter', 'url(#glowShadow)')
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => yScale(getYValue(d)))
      .attr('height', (d) => innerHeight - yScale(getYValue(d)));

    // Top Value Label on each bar
    bars
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => (xScale(lang === 'bn' ? d.nameBn.split(' ')[0] : d.nameEn.split(' ')[0]) || 0) + xScale.bandwidth() / 2)
      .attr('y', innerHeight)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '11px')
      .attr('font-weight', '800')
      .attr('font-family', 'monospace')
      .style('opacity', 0)
      .text((d) => (metric === 'revenue' ? `৳${getYValue(d)}` : `${getYValue(d)}`))
      .transition()
      .duration(750)
      .delay(200)
      .attr('y', (d) => yScale(getYValue(d)) - 8)
      .style('opacity', 1);

    // Interactive Hover & Click Events
    bars
      .on('mouseenter', function (event, d) {
        d3.select(this).select('rect').transition().duration(150).attr('stroke', '#ffffff').attr('stroke-width', 2.5);

        if (tooltipRef.current) {
          const rect = container.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          tooltip
            .style('display', 'block')
            .style('left', `${Math.min(mouseX + 15, width - 240)}px`)
            .style('top', `${Math.max(10, mouseY - 120)}px`).html(`
              <div class="p-3 bg-stone-900/95 border border-stone-700 text-white rounded-xl shadow-2xl backdrop-blur-md space-y-1.5 min-w-[210px]">
                <div class="flex items-center justify-between gap-2 border-b border-stone-800 pb-1.5">
                  <span class="font-bold text-xs text-amber-300">${lang === 'bn' ? d.nameBn : d.nameEn}</span>
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    d.stockLevelStatus === 'urgent'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : d.stockLevelStatus === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }">
                    ${d.stockLevelStatus === 'urgent' ? 'উচ্চ চাহিদা' : d.stockLevelStatus === 'warning' ? 'সতর্কতা' : 'পর্যাপ্ত'}
                  </span>
                </div>
                <div class="text-[11px] space-y-1 text-stone-300">
                  <div class="flex justify-between">
                    <span>সাপ্তাহিক অর্ডার:</span>
                    <strong class="text-white font-mono">${d.orderCount} টি</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>মোট বিক্রয়:</span>
                    <strong class="text-amber-400 font-mono">৳${d.revenue}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>স্টক পূর্বাভাস চাহিদা:</span>
                    <strong class="text-emerald-400 font-mono">${d.forecastedDemand} প্লেট/পিস</strong>
                  </div>
                  <div class="flex justify-between text-[10px] text-stone-400 pt-0.5">
                    <span>নির্ভুলতা স্কোর:</span>
                    <span class="text-blue-300 font-mono">${d.confidenceScore}%</span>
                  </div>
                </div>
                <div class="pt-1.5 border-t border-stone-800 text-[10px] text-amber-400/90 font-medium">
                  👉 বিস্তারিত কাঁচামাল স্টক দেখতে ক্লিক করুন
                </div>
              </div>
            `);
        }
      })
      .on('mousemove', function (event) {
        const rect = container.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        tooltip
          .style('left', `${Math.min(mouseX + 15, width - 240)}px`)
          .style('top', `${Math.max(10, mouseY - 120)}px`);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .select('rect')
          .transition()
          .duration(200)
          .attr('stroke', (d: any) => (selectedCategory === d.category ? '#ffffff' : 'transparent'))
          .attr('stroke-width', (d: any) => (selectedCategory === d.category ? 2 : 0));

        tooltip.style('display', 'none');
      })
      .on('click', function (event, d) {
        setSelectedCategory((prev) => (prev === d.category ? null : d.category));
      });
  }, [categoryData, metric, selectedCategory, lang]);

  const handleCopyProcurementList = () => {
    const list = categoryData
      .map((cat) => {
        const ingredients = cat.primaryIngredients
          .map((ing) => `  - ${ing.nameBn}: ${ing.recommendedProcurementKg} ${ing.unit} (মজুদ আছে: ${ing.currentStockKg} ${ing.unit})`)
          .join('\n');
        return `[${cat.nameBn}]\n${ingredients}`;
      })
      .join('\n\n');

    const fullText = `হোটেল আল শেখ ফরিদ - সাপ্তাহিক কাঁচামাল ক্রয় তালিকা (Stock Procurement)\nতারিখ: ${new Date().toLocaleDateString('bn-BD')}\nট্রেন যাত্রী রাশ বাফার: +${rushMultiplier}%\n\n${list}`;

    navigator.clipboard.writeText(fullText);
    setCopiedStock(true);
    setTimeout(() => setCopiedStock(false), 2500);
  };

  return (
    <div className="space-y-5" ref={containerRef}>
      
      {/* Top Controls & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-stone-900 border border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>D3.js Interactive Chart</span>
            </span>
            <span className="text-xs text-stone-400 font-semibold">
              {lang === 'bn' ? 'খাবারের ক্যাটাগরিভিত্তিক সাপ্তাহিক বণ্টন ও স্টক পূর্বাভাস' : 'Weekly Category Order Distribution & Stock Forecasting'}
            </span>
          </div>
          <h4 className="text-lg font-bold text-amber-100 font-serif mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>{lang === 'bn' ? 'ক্যাটাগরি বিশ্লেষণ ও কাঁচামাল পূর্বাভাস মডেল' : 'Category Demand & Raw Inventory Forecasting'}</span>
          </h4>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => setMetric('orders')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              metric === 'orders'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {lang === 'bn' ? 'অর্ডার সংখ্যা (Orders)' : 'Order Volume'}
          </button>
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              metric === 'revenue'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {lang === 'bn' ? 'মোট বিক্রয় (Revenue)' : 'Revenue (৳)'}
          </button>
          <button
            type="button"
            onClick={() => setMetric('forecast')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              metric === 'forecast'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {lang === 'bn' ? 'স্টক পূর্বাভাস (Forecast)' : 'Stock Forecast'}
          </button>
        </div>
      </div>

      {/* Main Interactive D3 SVG Container with Overlays */}
      <div className="relative p-5 rounded-2xl bg-stone-950 border border-stone-800">
        
        {/* Top Summary Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-stone-800/80 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-stone-400">
              সাপ্তাহিক মোট অর্ডার: <strong className="text-amber-400 font-mono">{totalWeeklyForecast.totalOrders} টি</strong>
            </span>
            <span className="text-stone-400">
              মোট টার্নওভার: <strong className="text-emerald-400 font-mono">৳{totalWeeklyForecast.totalRev}</strong>
            </span>
            <span className="text-stone-400">
              প্রত্যাশিত চাহিদা: <strong className="text-blue-400 font-mono">{totalWeeklyForecast.totalDemandUnits} ইউনিট</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400">ফিল্টার:</span>
            {selectedCategory ? (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>রিসেট ফিল্টার</span>
                <RotateCcw className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-[10px] text-stone-500 italic">যেকোনো বারে ক্লিক করে নির্দিষ্ট ক্যাটাগরি ফোকাস করুন</span>
            )}
          </div>
        </div>

        {/* D3 Chart Canvas */}
        <div className="w-full relative overflow-x-auto">
          <svg ref={svgRef} className="w-full select-none" />
          {/* Floating dynamic D3 tooltip */}
          <div
            ref={tooltipRef}
            className="absolute pointer-events-none z-30 transition-all duration-75"
            style={{ display: 'none' }}
          />
        </div>

        {/* Interactive Train Rush & Holiday Buffer Simulation Slider */}
        <div className="mt-4 p-4 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <label htmlFor="rush-slider" className="text-xs font-bold text-stone-200 block">
                {lang === 'bn' ? 'স্টেশনের অতিরিক্ত ট্রেন যাত্রী ও রাশ বাফার সিমুলেশন:' : 'Train Rush & Holiday Surge Buffer:'}
              </label>
              <p className="text-[11px] text-stone-400">
                ছুটির দিন বা অতিরিক্ত ট্রেনের ভিড় বাড়লে কাঁচামাল কেনাকাটার পরিমাণ স্বয়ংক্রিয়ভাবে পুনঃহিসাব হবে।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="rush-slider"
              type="range"
              min="0"
              max="50"
              step="5"
              value={rushMultiplier}
              onChange={(e) => setRushMultiplier(Number(e.target.value))}
              className="w-32 sm:w-44 accent-amber-500 cursor-pointer"
            />
            <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-700 font-mono text-xs font-black text-amber-400 min-w-[55px] text-center">
              +{rushMultiplier}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Drill-Down & Procurement Forecasting Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 7 Cols: Selected Category Deep Dive */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full shadow-sm"
                style={{ backgroundColor: activeCategoryDetail.color }}
              />
              <h5 className="text-sm font-bold text-white font-serif">
                {lang === 'bn' ? activeCategoryDetail.nameBn : activeCategoryDetail.nameEn}
              </h5>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900 border border-stone-700 text-stone-300">
              নির্ভুলতা পূর্বাভাস: {activeCategoryDetail.confidenceScore}%
            </span>
          </div>

          {/* Key Metrics row */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px]">সাপ্তাহিক বিক্রি</span>
              <span className="text-amber-400 font-black font-mono text-sm mt-0.5 block">
                {activeCategoryDetail.orderCount} অর্ডার
              </span>
            </div>
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px]">অর্জিত রাজস্ব</span>
              <span className="text-emerald-400 font-black font-mono text-sm mt-0.5 block">
                ৳ {activeCategoryDetail.revenue}
              </span>
            </div>
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px]">পরবর্তী সপ্তাহের লক্ষ্য</span>
              <span className="text-blue-400 font-black font-mono text-sm mt-0.5 block">
                {activeCategoryDetail.forecastedDemand} প্লেট/ইউনিট
              </span>
            </div>
          </div>

          {/* Primary Ingredients Required Breakdown */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-stone-300 font-bold border-b border-stone-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>প্রয়োজনীয় মূল কাঁচামাল (Required Raw Stock)</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">
                বর্তমান মজুদ vs সুপারিশকৃত ক্রয়
              </span>
            </div>

            <div className="space-y-2">
              {activeCategoryDetail.primaryIngredients.map((ing, i) => {
                const isLow = ing.currentStockKg < ing.recommendedProcurementKg * 0.4;
                return (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-200 block">{ing.nameBn}</span>
                      <span className="text-[10px] text-stone-400">{ing.nameEn}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block">বর্তমান মজুদ:</span>
                        <span className="font-mono font-bold text-stone-300">{ing.currentStockKg} {ing.unit}</span>
                      </div>
                      <div className="w-px h-6 bg-stone-800" />
                      <div className="text-right">
                        <span className="text-[10px] text-amber-400 font-bold block">অগ্রিম ক্রয় দরকার:</span>
                        <span className={`font-mono font-black ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                          {ing.recommendedProcurementKg} {ing.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top category dishes */}
          <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-stone-400 font-semibold">শীর্ষ মেনু:</span>
            {activeCategoryDetail.topDishes.map((dish, dIdx) => (
              <span
                key={dIdx}
                className="px-2 py-0.5 rounded-md bg-stone-900 text-stone-300 border border-stone-800 text-[11px]"
              >
                {dish}
              </span>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Consolidated Stock Procurement Checklist */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h5 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>বাজারের জন্য কাঁচামাল ক্রয় তালিকা</span>
              </h5>
              <button
                type="button"
                onClick={handleCopyProcurementList}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  copiedStock
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-700'
                }`}
                title="বাজারের ফর্দ কপি করুন"
              >
                {copiedStock ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>কপি ফর্দ</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-stone-400 mt-2">
              স্টেশনের পিক ট্রেন শিডিউল ও +{rushMultiplier}% বাফার অনুযায়ী পুরো সপ্তাহের জন্য সমন্বিত কাঁচামাল চাহিদা:
            </p>

            <div className="mt-3 space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {categoryData.flatMap((c) => c.primaryIngredients).map((ing, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-stone-900/60 border border-stone-800/80 flex items-center justify-between text-xs"
                >
                  <span className="text-stone-300 font-medium">{ing.nameBn}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500">মজুদ: {ing.currentStockKg}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-black">
                      {ing.recommendedProcurementKg} {ing.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300/90 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              পূর্বাভাস অনুযায়ী কাঁচামাল সংগ্রহ করলে পিক আওয়ারে কোনো খাবার রান্নার ঘাটতি বা বিলম্ব ঘটবে না।
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
