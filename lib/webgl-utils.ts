/**
 * WebGL compatibility utilities for gesture-controlled particle system
 */

export interface WebGLInfo {
    supported: boolean;
    version: string;
    renderer: string;
    vendor: string;
    maxTextureSize: number;
    maxVertexTextures: number;
    maxFragmentTextures: number;
    extensionCount: number;
}

export class WebGLUtils {
    /**
     * Check if WebGL is supported and working
     */
    static checkSupport(): boolean {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || 
                      canvas.getContext('webgl') || 
                      canvas.getContext('experimental-webgl');
            
            if (!gl || !(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
                return false;
            }

            // Check if context is working
            const contextLost = (gl as WebGLRenderingContext).isContextLost();
            canvas.remove();
            
            return !contextLost;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get detailed WebGL information
     */
    static getInfo(): WebGLInfo | null {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || 
                      canvas.getContext('webgl') || 
                      canvas.getContext('experimental-webgl') as WebGLRenderingContext;
            
            if (!gl) {
                return null;
            }

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const info: WebGLInfo = {
                supported: true,
                version: gl.getParameter(gl.VERSION),
                renderer: debugInfo 
                    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
                    : 'Unknown',
                vendor: debugInfo 
                    ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) 
                    : 'Unknown',
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxVertexTextures: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
                maxFragmentTextures: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
                extensionCount: gl.getSupportedExtensions()?.length || 0,
            };

            canvas.remove();
            return info;
        } catch (e) {
            return null;
        }
    }

    /**
     * Test WebGL performance
     */
    static testPerformance(): Promise<{ fps: number; stable: boolean }> {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            canvas.style.position = 'absolute';
            canvas.style.top = '-1000px';
            document.body.appendChild(canvas);

            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (!gl || !(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
                canvas.remove();
                resolve({ fps: 0, stable: false });
                return;
            }

            const webglContext = gl as WebGLRenderingContext;

            // Simple performance test
            let frameCount = 0;
            const startTime = performance.now();
            const testDuration = 1000; // 1 second

            function render() {
                webglContext.clearColor(Math.random(), Math.random(), Math.random(), 1);
                webglContext.clear(webglContext.COLOR_BUFFER_BIT);
                frameCount++;

                const elapsed = performance.now() - startTime;
                if (elapsed < testDuration) {
                    requestAnimationFrame(render);
                } else {
                    const fps = (frameCount / elapsed) * 1000;
                    const stable = fps > 30; // Consider stable if > 30 FPS
                    
                    canvas.remove();
                    resolve({ fps: Math.round(fps), stable });
                }
            }

            render();
        });
    }

    /**
     * Get recommendations based on WebGL capabilities
     */
    static getRecommendations(): string[] {
        const recommendations: string[] = [];
        
        if (!this.checkSupport()) {
            recommendations.push('WebGL is not supported. Please use a modern browser.');
            return recommendations;
        }

        const info = this.getInfo();
        if (!info) {
            recommendations.push('Unable to get WebGL information.');
            return recommendations;
        }

        // Check for common issues
        if (info.maxTextureSize < 2048) {
            recommendations.push('Limited texture support. Graphics performance may be reduced.');
        }

        if (info.maxVertexTextures < 4) {
            recommendations.push('Limited vertex texture support. Some effects may be disabled.');
        }

        if (info.renderer.toLowerCase().includes('software')) {
            recommendations.push('Software rendering detected. Please enable hardware acceleration.');
        }

        if (info.extensionCount < 10) {
            recommendations.push('Limited WebGL extensions. Some features may not work.');
        }

        return recommendations;
    }

    /**
     * Create a fallback message for unsupported browsers
     */
    static createFallbackMessage(): HTMLElement {
        const div = document.createElement('div');
        div.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    max-width: 500px;
                    text-align: center;
                    padding: 2rem;
                    background: rgba(0,0,0,0.8);
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.2);
                ">
                    <h1 style="margin-bottom: 1rem; font-size: 2rem;">WebGL Required</h1>
                    <p style="margin-bottom: 2rem; opacity: 0.8;">
                        This application requires WebGL to display 3D graphics and process hand tracking.
                    </p>
                    <div style="text-align: left; margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 0.5rem;">Please try:</h3>
                        <ul style="opacity: 0.8; line-height: 1.6;">
                            <li>• Use Chrome, Firefox, Safari, or Edge</li>
                            <li>• Enable hardware acceleration</li>
                            <li>• Update your graphics drivers</li>
                            <li>• Restart your browser</li>
                        </ul>
                    </div>
                    <button onclick="window.location.reload()" style="
                        padding: 0.75rem 1.5rem;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1rem;
                    ">
                        Try Again
                    </button>
                </div>
            </div>
        `;
        return div;
    }
}