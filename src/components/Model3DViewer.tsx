'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface Model3DViewerProps {
    modelPath: string;
}

// Outline shader
const outlineVertexShader = `
  uniform float thickness;
  void main() {
    vec3 newPosition = position + normal * thickness;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const outlineFragmentShader = `
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Model3DViewer({ modelPath }: Model3DViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const animationIdRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Parameters (User defined defaults)
        const params = {
            bloomStrength: 0.128,
            bloomRadius: 0.011,
            bloomThreshold: 0.836,
            emissiveIntensity: 1.672,
            roughness: 1,
            metalness: 0,
            outlineThickness: 0.8,
            scalePercent: 79.3,
        };

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf3f4f6);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 30, 100);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        container.style.position = 'relative';
        rendererRef.current = renderer;

        // Post-processing
        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            params.bloomStrength,
            params.bloomRadius,
            params.bloomThreshold
        );

        // Create Composer
        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);
        composerRef.current = composer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2;
        controls.enableZoom = false;
        controls.enablePan = false;
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-50, 50, -50);
        scene.add(directionalLight2);

        // Load model
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;

                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                const size = box.getSize(new THREE.Vector3());
                const modelMaxDim = Math.max(size.x, size.y, size.z);

                // Final Scale
                const finalScale = (80 * (params.scalePercent / 100)) / modelMaxDim;
                model.scale.setScalar(finalScale);

                model.updateMatrixWorld(true);

                const meshes: THREE.Mesh[] = [];
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        meshes.push(child as THREE.Mesh);
                    }
                });

                meshes.forEach((mesh) => {
                    try {
                        const meshBox = new THREE.Box3().setFromObject(mesh);
                        const meshCenter = meshBox.getCenter(new THREE.Vector3());

                        const isTop = meshCenter.y > 0;
                        const fillColor = isTop ? new THREE.Color(0x481267) : new THREE.Color(0xE8B44C);
                        const outlineColor = new THREE.Color(0x000000);

                        const newMaterial = new THREE.MeshStandardMaterial({
                            color: fillColor,
                            roughness: params.roughness,
                            metalness: params.metalness,
                            emissive: fillColor,
                            emissiveIntensity: params.emissiveIntensity
                        });
                        mesh.material = newMaterial;

                        let outlineGeometry = mesh.geometry.clone();
                        if (outlineGeometry.attributes.normal) {
                            outlineGeometry.deleteAttribute('normal');
                        }
                        outlineGeometry = BufferGeometryUtils.mergeVertices(outlineGeometry);
                        outlineGeometry.computeVertexNormals();

                        const outlineMaterial = new THREE.ShaderMaterial({
                            vertexShader: outlineVertexShader,
                            fragmentShader: outlineFragmentShader,
                            uniforms: {
                                thickness: { value: params.outlineThickness },
                                color: { value: outlineColor }
                            },
                            side: THREE.BackSide
                        });

                        const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
                        mesh.add(outlineMesh);

                    } catch (e) {
                        console.error("Error modifying mesh:", e);
                    }
                });

                scene.add(model);
                controls.target.set(0, 0, 0);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
            }
        );

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();
            if (composerRef.current) {
                composerRef.current.render();
            } else {
                renderer.render(scene, camera);
            }
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;

            cameraRef.current.aspect = newWidth / newHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newWidth, newHeight);
            composerRef.current?.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationIdRef.current);

            if (rendererRef.current && containerRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }

            controlsRef.current?.dispose();
        };
    }, [modelPath]);

    return <div ref={containerRef} className="model-3d-container" />;
}
