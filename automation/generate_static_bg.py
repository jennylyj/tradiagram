
import json
import os

def generate_svg():
    date = "20251231"
    line_kind = "LINE_WN"
    
    # Load data
    try:
        with open(f'public/data/{date}.json', 'r', encoding='utf-8') as f:
            daily_data = json.load(f)
        with open('public/references/Route.json', 'r', encoding='utf-8') as f:
            route_data = json.load(f)
        with open('public/references/SVG_X_Axis.json', 'r', encoding='utf-8') as f:
            svg_x_axis = json.load(f)
        with open('public/references/SVG_Y_Axis.json', 'r', encoding='utf-8') as f:
            svg_y_axis = json.load(f)
        with open('public/references/CarKind.json', 'r', encoding='utf-8') as f:
            car_kind = json.load(f)
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    # Process Line Data (simplified)
    stations = svg_y_axis.get(line_kind, [])
    if not stations:
        print(f"No stations found for {line_kind}")
        return
    
    max_y = stations[-1]['SVGYAXIS'] + 100
    width = 1200 * 24 + 100 # Simplified width
    
    # SVG Header
    svg_content = [
        f'<svg width="{width}" height="{max_y}" xmlns="http://www.w3.org/2000/svg">',
        '<style>',
        '.train { fill: none; stroke-width: 8; opacity: 0.6; }', # 降低不透明度，在白底上較柔和
        '.grid { stroke: rgba(0,0,0,0.05); stroke-width: 2; }', # 讓網格線變淡灰色
        '</style>'
    ]
    
    # Draw Grid (simplified)
    for i in range(25):
        x = 50 + i * 1200
        svg_content.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{max_y}" class="grid" />')
    
    for st in stations:
        y = st['SVGYAXIS'] + 50
        svg_content.append(f'<line x1="0" y1="{y}" x2="{width}" y2="{y}" class="grid" />')

    # Draw Trains (simplified logic)
    train_count = 0
    train_infos = daily_data.get('TrainInfos', [])
    if not train_infos:
        # Try if it's a list directly
        if isinstance(daily_data, list):
            train_infos = daily_data
        else:
            print("Could not find TrainInfos in JSON")
            return

    for train in train_infos:
        stops = train.get('TimeInfos', [])
        path_points = []
        
        for stop in stops:
            st_id = stop.get('Station')
            if not st_id: continue
            
            # Find station in our line
            st_info = next((s for s in stations if s['ID'] == st_id), None)
            if st_info:
                # Calculate X (time)
                arr_time = stop.get('ARRTime', stop.get('DEPTime'))
                if not arr_time or arr_time == "": continue
                try:
                    parts = arr_time.split(':')
                    h = int(parts[0])
                    m = int(parts[1])
                except:
                    continue
                    
                # Adjust hour for diagram (starts at 4am usually)
                adj_h = h - 4
                if adj_h < 0: adj_h += 24
                
                x = 50 + (adj_h * 60 + m) * 20
                y = st_info['SVGYAXIS'] + 50
                path_points.append(f"{x},{y}")
        
        if len(path_points) > 1:
            # 使用適合白底的顏色
            train_no = train.get('Train', '')
            color = "#666666" # 預設深灰色
            if train_no.startswith('1'): color = "#ff9900" # 自強號用橘色
            elif train_no.startswith('2'): color = "#ff6600" # 莒光
            elif train_no.startswith('4'): color = "#007aff" # 區間車用藍色
            
            svg_content.append(f'<path d="M{" ".join(path_points)}" class="train" stroke="{color}" />')
            train_count += 1
            if train_count > 300: break # Limit for background

    svg_content.append('</svg>')
    
    output_path = 'public/images/home-bg.svg'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(svg_content))
    
    print(f"Successfully generated {output_path} with {train_count} trains.")

if __name__ == "__main__":
    generate_svg()
