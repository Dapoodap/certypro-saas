"use client";
import React, { useState, useRef, useCallback, useEffect, Suspense } from "react";
import {
  Award,
  ArrowLeft,
  Save,
  Eye,
  Code,
  Download,
  Type,
  ImageIcon,
  Square,
  Trash2,
  Copy,
  RotateCcw,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { usePostTemplate } from "@/hooks/usePostTemplate";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetTemplateById } from "@/hooks/useGetTemplatesById";
import { useUpdateTemplate } from "@/hooks/useUpdateTemplate";
import { toast } from "@/components/ui/use-toast";

interface TemplateComponent {
  id: string;
  type: "text" | "image" | "shape";
  content: string;
  style: {
    position: { x: number; y: number };
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: string;
    width?: string;
    height?: string;
    backgroundColor?: string;
    borderRadius?: string;
  };
}

interface Template {
  id: string;
  name: string;
  backgroundImage: string;
  components: TemplateComponent[];
  settings: {
    width: number;
    height: number;
    padding: string;
  };
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  componentId: string | null;
  resizeHandle: string | null;
  startPos: { x: number; y: number };
  startSize: { width: number; height: 0 };
  startPosition: { x: number; y: number };
  offset: { x: number; y: number };
}

function CertificateTemplateEditor() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { data: templateSpesific, isLoading: isLoadingTemplateSpesific } =
    useGetTemplateById(editId || undefined);
  const { data: templateSpesificUpdate, trigger: updateTemplate } =
    useUpdateTemplate();
  const { trigger } = usePostTemplate();
  const router = useRouter();
  // Default professional certificate template
  const [template, setTemplate] = useState<Template>({
    id: "1",
    name: "Professional Certificate",
    backgroundImage:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600",
    components: [
      {
        id: "title",
        type: "text",
        content: "CERTIFICATE OF ACHIEVEMENT",
        style: {
          position: { x: 50, y: 20 },
          fontSize: "28px",
          fontWeight: "bold",
          color: "#1f2937",
          textAlign: "center",
          width: "400px",
          height: "40px",
        },
      },
      {
        id: "subtitle",
        type: "text",
        content: "This is to certify that",
        style: {
          position: { x: 50, y: 35 },
          fontSize: "16px",
          fontWeight: "normal",
          color: "#6b7280",
          textAlign: "center",
          width: "300px",
          height: "25px",
        },
      },
      {
        id: "recipient",
        type: "text",
        content: "{{nama}}",
        style: {
          position: { x: 50, y: 50 },
          fontSize: "32px",
          fontWeight: "bold",
          color: "#dc2626",
          textAlign: "center",
          width: "400px",
          height: "40px",
        },
      },
      {
        id: "description",
        type: "text",
        content:
          "has successfully completed the training program\n{{program}} \nwith outstanding performance",
        style: {
          position: { x: 50, y: 65 },
          fontSize: "16px",
          fontWeight: "normal",
          color: "#374151",
          textAlign: "center",
          width: "450px",
          height: "60px",
        },
      },
      {
        id: "date",
        type: "text",
        content: "Date: {{tanggal}}",
        style: {
          position: { x: 25, y: 85 },
          fontSize: "14px",
          fontWeight: "normal",
          color: "#6b7280",
          textAlign: "left",
          width: "200px",
          height: "20px",
        },
      },
      {
        id: "signature",
        type: "text",
        content: "{{penandatangan}}\nDirector",
        style: {
          position: { x: 75, y: 85 },
          fontSize: "14px",
          fontWeight: "normal",
          color: "#374151",
          textAlign: "center",
          width: "150px",
          height: "40px",
        },
      },
    ],
    settings: {
      width: 800,
      height: 600,
      padding: "20px",
    },
  });

  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [showCode, setShowCode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [templateName, setTemplateName] = useState(template.name);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    componentId: null,
    resizeHandle: null,
    startPos: { x: 0, y: 0 },
    startSize: { width: 0, height: 0 },
    startPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (templateSpesific) {
      setTemplate(templateSpesific.data);
      setTemplateName(templateSpesific.name);
    }
  }, [templateSpesific]);
  const componentLibrary = [
    {
      type: "text",
      icon: Type,
      label: "Add Text",
      desc: "Add custom text or placeholders",
    },
    {
      type: "image",
      icon: ImageIcon,
      label: "Add Image",
      desc: "Add logo or decorative image",
    },
    {
      type: "shape",
      icon: Square,
      label: "Add Shape",
      desc: "Add rectangle or decorative shape",
    },
  ];

  // Sample data for preview
  const sampleData = {
    nama: "John Doe",
    program: "Digital Marketing Mastery",
    tanggal: "December 15, 2024",
    penandatangan: "Jane Smith",
  };

  const addComponent = (type: string) => {
    const newComponent: TemplateComponent = {
      id: `component-${Date.now()}`,
      type: type as "text" | "image" | "shape",
      content:
        type === "text"
          ? "New Text Element"
          : type === "image"
          ? "https://via.placeholder.com/100x100/3b82f6/ffffff?text=IMG"
          : "",
      style: {
        position: { x: 50, y: 50 },
        fontSize: type === "text" ? "16px" : undefined,
        fontWeight: type === "text" ? "normal" : undefined,
        color: type === "text" ? "#000000" : undefined,
        textAlign: type === "text" ? "center" : undefined,
        width: type === "text" ? "200px" : "100px",
        height: type === "text" ? "30px" : "100px",
        backgroundColor: type === "shape" ? "#3b82f6" : undefined,
        borderRadius: type === "shape" ? "8px" : undefined,
      },
    };

    setTemplate((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
    setSelectedComponent(newComponent.id);
  };

  const updateComponent = (id: string, updates: Partial<TemplateComponent>) => {
    setTemplate((prev) => ({
      ...prev,
      components: prev.components.map((comp) =>
        comp.id === id ? { ...comp, ...updates } : comp
      ),
    }));
  };

  const deleteComponent = (id: string) => {
    setTemplate((prev) => ({
      ...prev,
      components: prev.components.filter((comp) => comp.id !== id),
    }));
    setSelectedComponent(null);
  };

  const duplicateComponent = (id: string) => {
    const component = template.components.find((c) => c.id === id);
    if (component) {
      const newComponent = {
        ...component,
        id: `component-${Date.now()}`,
        style: {
          ...component.style,
          position: {
            x: component.style.position.x + 5,
            y: component.style.position.y + 5,
          },
        },
      };
      setTemplate((prev) => ({
        ...prev,
        components: [...prev.components, newComponent],
      }));
      setSelectedComponent(newComponent.id);
    }
  };

  const resetTemplate = () => {
    if (
      confirm(
        "Are you sure you want to reset the template? This will remove all your changes."
      )
    ) {
      setTemplate({
        id: "1",
        name: "Professional Certificate",
        backgroundImage:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600",
        components: [
          {
            id: "title",
            type: "text",
            content: "CERTIFICATE OF ACHIEVEMENT",
            style: {
              position: { x: 50, y: 20 },
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1f2937",
              textAlign: "center",
              width: "400px",
              height: "40px",
            },
          },
        ],
        settings: {
          width: 800,
          height: 600,
          padding: "20px",
        },
      });
      setSelectedComponent(null);
    }
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, componentId: string) => {
      // Prevent dragging when clicking on input/textarea elements
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setSelectedComponent(componentId);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const component = template.components.find((c) => c.id === componentId);
      if (!component) return;

      const componentCenterX =
        (component.style.position.x / 100) * canvasRect.width;
      const componentCenterY =
        (component.style.position.y / 100) * canvasRect.height;
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      setDragState({
        isDragging: false, // Don't start dragging immediately
        isResizing: false,
        componentId,
        resizeHandle: null,
        startPos: { x: e.clientX, y: e.clientY },
        startSize: { width: 0, height: 0 },
        startPosition: { x: 0, y: 0 },
        offset: {
          x: mouseX - componentCenterX,
          y: mouseY - componentCenterY,
        },
      });
    },
    [template.components]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, componentId: string, handle: string) => {
      e.preventDefault();
      e.stopPropagation();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const component = template.components.find((c) => c.id === componentId);
      if (!component) return;

      const canvasRect = canvas.getBoundingClientRect();
      const currentWidth = Number.parseFloat(component.style.width || "100");
      const currentHeight = Number.parseFloat(component.style.height || "100");

      setDragState({
        isDragging: false,
        isResizing: true,
        componentId,
        resizeHandle: handle,
        startPos: { x: e.clientX, y: e.clientY },
        startSize: { width: currentWidth, height: currentHeight as 0 },
        startPosition: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
      });
    },
    [template.components]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.componentId || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      const component = template.components.find(
        (c) => c.id === dragState.componentId
      );
      if (!component) return;

      // Calculate distance moved from start position
      const deltaX = e.clientX - dragState.startPos.x;
      const deltaY = e.clientY - dragState.startPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Start dragging only if moved more than 5 pixels (drag threshold)
      if (!dragState.isDragging && !dragState.isResizing && distance > 5) {
        setDragState((prev) => ({ ...prev, isDragging: true }));
      }

      if (dragState.isDragging) {
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;

        const newX = mouseX - dragState.offset.x;
        const newY = mouseY - dragState.offset.y;

        const newXPercent = Math.max(
          0,
          Math.min(100, (newX / canvasRect.width) * 100)
        );
        const newYPercent = Math.max(
          0,
          Math.min(100, (newY / canvasRect.height) * 100)
        );

        updateComponent(dragState.componentId, {
          style: {
            ...component.style,
            position: { x: newXPercent, y: newYPercent },
          },
        });
      } else if (dragState.isResizing) {
        let newWidth = dragState.startSize.width;
        let newHeight = dragState.startSize.height as number;

        switch (dragState.resizeHandle) {
          case "se":
            newWidth = Math.max(20, dragState.startSize.width + deltaX);
            newHeight = Math.max(20, dragState.startSize.height + deltaY);
            break;
          case "sw":
            newWidth = Math.max(20, dragState.startSize.width - deltaX);
            newHeight = Math.max(20, dragState.startSize.height + deltaY);
            break;
          case "ne":
            newWidth = Math.max(20, dragState.startSize.width + deltaX);
            newHeight = Math.max(20, dragState.startSize.height - deltaY);
            break;
          case "nw":
            newWidth = Math.max(20, dragState.startSize.width - deltaX);
            newHeight = Math.max(20, dragState.startSize.height - deltaY);
            break;
        }

        updateComponent(dragState.componentId, {
          style: {
            ...component.style,
            width: `${newWidth}px`,
            height: `${newHeight}px`,
          },
        });
      }
    },
    [dragState, template.components]
  );

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      isResizing: false,
      componentId: null,
      resizeHandle: null,
      startPos: { x: 0, y: 0 },
      startSize: { width: 0, height: 0 },
      startPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
    });
  }, []);

  React.useEffect(() => {
    if (dragState.componentId) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      if (dragState.isDragging) {
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      } else if (dragState.isResizing) {
        document.body.style.cursor = "nw-resize";
        document.body.style.userSelect = "none";
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [
    dragState.componentId,
    dragState.isDragging,
    dragState.isResizing,
    handleMouseMove,
    handleMouseUp,
  ]);

  const replacePreviewPlaceholders = (content: string) => {
    return content.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return sampleData[trimmedKey as keyof typeof sampleData] || match;
    });
  };

  const handleSave = async () => {
    try {
      if (editId) {
        updateTemplate({
          id: editId,
          data: {
            templateName: templateName,
            eventName: "Sample Event",
            backgroundImage: template.backgroundImage,
            components: template.components,
            settings: template.settings,
          },
          name: templateName,
        });
        toast({
          title: "Sukses",
          description: "Data berhasil disimpan.",
          duration: 1000,
          variant: "success", // atau "destructive" untuk error
        });
        router.push("/templates/list")
      } else {
        trigger({
          name: templateName,
          data: {
            templateName: templateName,
            eventName: "Sample Event",
            backgroundImage: template.backgroundImage,
            components: template.components,
            settings: template.settings,
          },
        });
              toast({
        title: "Sukses",
        description: "Data berhasil disimpan.",
        duration: 1000,
        variant: "success", // atau "destructive" untuk error
      });
      router.push("/templates/list");
      }

    } catch (error) {
      toast({
        title: "Gagal",
        description: "Data gagal disimpan.",
        duration: 1000,
        variant: "destructive", // atau "destructive" untuk error
      });
      console.log(error);
    }
  };
  const generateTemplateCode = () => {
    const templateCode = {
      templateName: template.name,
      eventName: "Sample Event",
      backgroundImage: template.backgroundImage,
      components: template.components,
      settings: template.settings,
    };

    return `// Template Configuration
const templateData = ${JSON.stringify(templateCode, null, 2)}

// Usage with PDFGenerator:
// const pdf = await PDFGenerator.generateCertificatePDF(templateData, userData)
// const zip = await PDFGenerator.generateCertificatesZip(templateData, userDataArray)`;
  };

  const selectedComp = template.components.find(
    (comp) => comp.id === selectedComponent
  );

  return (
        <Suspense fallback={<div>Loading editor...</div>}>
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">
                    Certificate Template Editor
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                  showPreview
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setShowCode(!showCode)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                  showCode
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                }`}
              >
                <Code className="w-4 h-4" />
                <span>Code</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save Template</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Component Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Template Settings
                </h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Image URL
                    </label>
                    <input
                      type="text"
                      value={template.backgroundImage}
                      onChange={(e) =>
                        setTemplate((prev) => ({
                          ...prev,
                          backgroundImage: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Add Components
                </h3>
                <div className="space-y-2">
                  {componentLibrary.map(({ type, icon: Icon, label, desc }) => (
                    <button
                      key={type}
                      onClick={() => addComponent(type)}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {label}
                          </div>
                          <div className="text-xs text-gray-500">{desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={resetTemplate}
                    className="w-full px-3 py-2 text-sm text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Template</span>
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export Template</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Certificate Canvas
                  </h2>
                  <div className="text-sm text-gray-500">
                    {template.settings.width} × {template.settings.height}px
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div
                    ref={canvasRef}
                    className="relative bg-white rounded-lg shadow-inner overflow-hidden mx-auto"
                    style={{
                      width: "100%",
                      maxWidth: "800px",
                      aspectRatio: `${template.settings.width}/${template.settings.height}`,
                      backgroundImage: template.backgroundImage
                        ? `url(${template.backgroundImage})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    onClick={() => setSelectedComponent(null)}
                  >
                    {/* Background overlay for better text visibility */}
                    <div className="absolute inset-0 bg-white/10"></div>

                    {template.components.map((component) => (
                      <div
                        key={component.id}
                        className={`absolute cursor-move select-none group ${
                          selectedComponent === component.id
                            ? "ring-2 ring-blue-500 ring-offset-2"
                            : ""
                        }`}
                        style={{
                          left: `${component.style.position.x}%`,
                          top: `${component.style.position.y}%`,
                          transform: "translate(-50%, -50%)",
                          width: component.style.width,
                          height: component.style.height,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, component.id)}
                      >
                        {component.type === "text" && (
                          <div
                            className="w-full h-full flex items-center justify-center px-2 py-1 relative"
                            style={{
                              fontSize: component.style.fontSize,
                              fontWeight: component.style.fontWeight,
                              color: showPreview
                                ? component.style.color
                                : component.style.color,
                              textAlign: component.style.textAlign as any,
                            }}
                          >
                            <span
                              className="whitespace-pre-line leading-tight"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComponent(component.id);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {showPreview
                                ? replacePreviewPlaceholders(component.content)
                                : component.content}
                            </span>
                          </div>
                        )}

                        {component.type === "image" && (
                          <div
                            className="w-full h-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center"
                            style={{
                              borderRadius: component.style.borderRadius,
                            }}
                          >
                            {component.content ? (
                              <img
                                src={component.content || "/placeholder.svg"}
                                alt="Certificate element"
                                className="w-full h-full object-cover"
                                style={{
                                  borderRadius: component.style.borderRadius,
                                }}
                              />
                            ) : (
                              <div className="text-center text-gray-500">
                                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                <span className="text-xs">Image</span>
                              </div>
                            )}
                          </div>
                        )}

                        {component.type === "shape" && (
                          <div
                            className="w-full h-full"
                            style={{
                              backgroundColor: component.style.backgroundColor,
                              borderRadius: component.style.borderRadius,
                            }}
                          />
                        )}

                        {/* Selection controls */}
                        {selectedComponent === component.id && (
                          <>
                            <div className="absolute -top-8 left-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateComponent(component.id);
                                }}
                                className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                title="Duplicate"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteComponent(component.id);
                                }}
                                className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Resize handles */}
                            <div
                              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-se-resize hover:bg-blue-700"
                              onMouseDown={(e) =>
                                handleResizeMouseDown(e, component.id, "se")
                              }
                              title="Resize"
                            ></div>
                            <div
                              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-sw-resize hover:bg-blue-700"
                              onMouseDown={(e) =>
                                handleResizeMouseDown(e, component.id, "sw")
                              }
                            ></div>
                            <div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-ne-resize hover:bg-blue-700"
                              onMouseDown={(e) =>
                                handleResizeMouseDown(e, component.id, "ne")
                              }
                            ></div>
                            <div
                              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-nw-resize hover:bg-blue-700"
                              onMouseDown={(e) =>
                                handleResizeMouseDown(e, component.id, "nw")
                              }
                            ></div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Properties
                </h2>
              </div>

              {selectedComp ? (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={selectedComp.content}
                      onChange={(e) =>
                        updateComponent(selectedComp.id, {
                          content: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter text or use {{placeholder}} for dynamic content"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {` Use placeholders like {{nama}}, {{program}}, {{tanggal}}
`}
                    </div>
                  </div>

                  {selectedComp.type === "text" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Font Size
                          </label>
                          <input
                            type="text"
                            value={selectedComp.style.fontSize || "16px"}
                            onChange={(e) =>
                              updateComponent(selectedComp.id, {
                                style: {
                                  ...selectedComp.style,
                                  fontSize: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                          </label>
                          <input
                            type="color"
                            value={selectedComp.style.color || "#000000"}
                            onChange={(e) =>
                              updateComponent(selectedComp.id, {
                                style: {
                                  ...selectedComp.style,
                                  color: e.target.value,
                                },
                              })
                            }
                            className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Weight
                        </label>
                        <select
                          value={selectedComp.style.fontWeight || "normal"}
                          onChange={(e) =>
                            updateComponent(selectedComp.id, {
                              style: {
                                ...selectedComp.style,
                                fontWeight: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="600">Semi Bold</option>
                          <option value="300">Light</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text Alignment
                        </label>
                        <div className="flex space-x-1">
                          {["left", "center", "right"].map((align) => (
                            <button
                              key={align}
                              onClick={() =>
                                updateComponent(selectedComp.id, {
                                  style: {
                                    ...selectedComp.style,
                                    textAlign: align,
                                  },
                                })
                              }
                              className={`flex-1 p-2 rounded-lg border transition-colors ${
                                selectedComp.style.textAlign === align
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {align === "left" && (
                                <AlignLeft className="w-4 h-4 mx-auto" />
                              )}
                              {align === "center" && (
                                <AlignCenter className="w-4 h-4 mx-auto" />
                              )}
                              {align === "right" && (
                                <AlignRight className="w-4 h-4 mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedComp.type === "shape" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <input
                          type="color"
                          value={
                            selectedComp.style.backgroundColor || "#3b82f6"
                          }
                          onChange={(e) =>
                            updateComponent(selectedComp.id, {
                              style: {
                                ...selectedComp.style,
                                backgroundColor: e.target.value,
                              },
                            })
                          }
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Border Radius
                        </label>
                        <input
                          type="text"
                          value={selectedComp.style.borderRadius || "8px"}
                          onChange={(e) =>
                            updateComponent(selectedComp.id, {
                              style: {
                                ...selectedComp.style,
                                borderRadius: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 8px, 50%, 0"
                        />
                      </div>
                    </>
                  )}

                  {selectedComp.type === "image" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={selectedComp.content}
                        onChange={(e) =>
                          updateComponent(selectedComp.id, {
                            content: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width
                      </label>
                      <input
                        type="text"
                        value={selectedComp.style.width || "100px"}
                        onChange={(e) =>
                          updateComponent(selectedComp.id, {
                            style: {
                              ...selectedComp.style,
                              width: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height
                      </label>
                      <input
                        type="text"
                        value={selectedComp.style.height || "100px"}
                        onChange={(e) =>
                          updateComponent(selectedComp.id, {
                            style: {
                              ...selectedComp.style,
                              height: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => duplicateComponent(selectedComp.id)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => deleteComponent(selectedComp.id)}
                        className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Move className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm">
                    Select a component to edit its properties
                  </p>
                  <p className="text-xs mt-1">
                    Click on any element in the canvas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Modal */}
        {showCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Template Code
                </h2>
                <button
                  onClick={() => setShowCode(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-auto max-h-[60vh]">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                  <code>{generateTemplateCode()}</code>
                </pre>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateTemplateCode());
                      alert("Code copied to clipboard!");
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Code</span>
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Data Info */}
        {showPreview && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Preview Data
            </h3>
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">{{nama}}:</span>
                <span className="ml-2 text-blue-700">{sampleData.nama}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">{{program}}:</span>
                <span className="ml-2 text-blue-700">{sampleData.program}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">{{tanggal}}:</span>
                <span className="ml-2 text-blue-700">{sampleData.tanggal}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">{{penandatangan}}:</span>
                <span className="ml-2 text-blue-700">{sampleData.penandatangan}</span>
              </div>
            </div> */}
            <p className="text-xs text-blue-600 mt-3">
              This is sample data used for preview. In production, real
              participant data will be used.
            </p>
          </div>
        )}
      </div>
    </div>
        </Suspense>

    
  );
}
export default function CertificateTemplateEditorPage() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <CertificateTemplateEditor />
    </Suspense>
  );
}